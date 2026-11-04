import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildIndex, buildSite } from '../build-index.mjs';
import { DOWNLOAD_URL, SITE_URL, renderLandingPage, validExtras } from '../lib/landing-page.mjs';
import { makeGallery, validFamily } from './helpers.mjs';

const NOW = new Date('2026-11-01T12:00:00Z');
const SITE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'site');
const HOSTILE = '</script><script>alert(1)</script>';

function preview(polarity = 'dark', color = '#336699') {
  return {
    polarity,
    colors: Object.fromEntries(
      ['canvas', 'sunken', 'raised', 'ink', 'text', 'muted', 'edge', 'selected', 'selectedInk', 'brand', 'fill', 'onFill'].map((k) => [k, color]),
    ),
    terminal: { background: color, foreground: color, ansi: Array.from({ length: 16 }, () => color) },
    syntax: Object.fromEntries(
      ['text', 'keyword', 'control', 'function', 'type', 'string', 'number', 'variable', 'comment'].map((k) => [k, color]),
    ),
  };
}

/** Gives the gallery a stand-in for Kepler's validator that reports the given previews by theme id. */
function withVendor(root, previews) {
  mkdirSync(join(root, 'vendor'), { recursive: true });
  writeFileSync(
    join(root, 'vendor', 'kepler-theme-check.mjs'),
    `export const version = '9.9.9';
const previews = ${JSON.stringify(previews)};
export function checkThemeFamily(text) {
  const family = JSON.parse(text);
  return { ok: true, errors: [], notices: [], reservedIds: [], themes: family.themes.map((t) => ({ id: t.id, contrastFailures: [], ...(previews[t.id] ? { preview: previews[t.id] } : {}) })) };
}
`,
  );
}

async function build(root) {
  const outDir = mkdtempSync(join(tmpdir(), 'kepler-themes-dist-'));
  await buildSite({ root, outDir, siteDir: SITE_DIR, now: NOW });
  return { outDir, html: readFileSync(join(outDir, 'index.html'), 'utf8') };
}

function dataBlock(html) {
  const match = html.match(/<script type="application\/json" id="gallery-data">([\s\S]*?)<\/script>/);
  assert.ok(match, 'the page carries a data block');
  return match[1];
}

function entry(slug, addedAt, extra = {}) {
  return {
    slug,
    name: slug,
    author: 'Ada',
    maintainers: ['ada'],
    tags: [],
    version: '1.0.0',
    addedAt,
    family: validFamily({ name: slug, themes: [{ id: `${slug}-dark`, name: `${slug} Dark`, extends: 'dark' }] }),
    ...extra,
  };
}

const index = (families) => ({ indexVersion: 1, generatedAt: NOW.toISOString(), checkedWith: '9.9.9', families, withdrawn: [] });

test('hostile family text is escaped in the page and cannot close the data block', async () => {
  const family = validFamily({
    name: HOSTILE,
    author: `"Ada" & 'Bob'`,
    description: `quote " amp & lt < gt > line\u2028sep\u2029end ${HOSTILE}`,
    themes: [
      { id: 'hostile-dark', name: HOSTILE, extends: 'dark' },
      { id: 'hostile-light', name: `A & "B" \u2028`, extends: 'light' },
    ],
  });
  const root = makeGallery({ hostile: { family, gallery: { maintainers: ['ada'], tags: ['blue'] } } });
  withVendor(root, { 'hostile-dark': preview('dark') });
  const { html } = await build(root);

  assert.ok(!html.includes('<script>alert'), 'no injected script element');
  assert.ok(!html.includes(HOSTILE));
  assert.equal(html.match(/<script/g).length, 3, 'only the data block and the two page scripts');
  assert.ok(html.includes('&lt;/script&gt;&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(html.includes('by &quot;Ada&quot; &amp; &#39;Bob&#39;'));

  const block = dataBlock(html);
  assert.ok(!/[<>&\u2028\u2029]/.test(block), 'the block holds none of the characters that end it');
  const data = JSON.parse(block);
  assert.equal(data.families[0].themes[0].name, HOSTILE, 'the escapes read back as the original text');
  assert.equal(data.families[0].themes[1].name, `A & "B" \u2028`);
});

test('a preview with a value that is not a hex color is dropped and the family renders without a frame', async () => {
  const bad = preview('dark');
  bad.syntax.keyword = 'red;background:url(//evil.example/x)';
  const root = makeGallery({
    bad: { family: validFamily({ name: 'Bad', themes: [{ id: 'bad-dark', name: 'Bad Dark', extends: 'dark' }] }) },
    good: { family: validFamily({ name: 'Good', themes: [{ id: 'good-dark', name: 'Good Dark', extends: 'dark' }] }) },
  });
  withVendor(root, { 'bad-dark': bad, 'good-dark': preview('dark') });
  const { html } = await build(root);

  assert.ok(!html.includes('evil.example'));
  const [badCard, goodCard] = [
    html.slice(html.indexOf('data-family="bad"'), html.indexOf('data-family="good"')),
    html.slice(html.indexOf('data-family="good"')),
  ];
  assert.ok(!badCard.includes('class="sweep"'));
  assert.ok(!badCard.includes('class="swatches"'), 'no variant dot for a theme without a preview');
  assert.ok(goodCard.includes('class="sweep"'));
  const data = JSON.parse(dataBlock(html));
  assert.equal(data.families.find((f) => f.slug === 'bad').themes[0].preview, null);
  assert.deepEqual(data.hero, [{ slug: 'good', id: 'good-dark' }], 'no planet for the dropped theme');
});

test('a short or malformed color list is also dropped', () => {
  const short = preview('dark');
  short.terminal.ansi.pop();
  const shaped = preview('dark');
  shaped.polarity = 'sepia';
  const missing = preview('dark');
  delete missing.colors.brand;
  const page = renderLandingPage(index([entry('a', '2026-01-01')]), { a: { 'a-dark': short } });
  assert.ok(!page.includes('class="sweep"'));
  for (const odd of [shaped, missing]) {
    assert.ok(!renderLandingPage(index([entry('a', '2026-01-01')]), { a: { 'a-dark': odd } }).includes('class="sweep"'));
  }
});

test('an empty gallery still renders the hero, the vacant card and the countdown', async () => {
  const { html } = await build(makeGallery({}));
  assert.ok(html.includes('id="system"'));
  assert.ok(html.includes('Yours could be next.'));
  assert.ok(html.includes('T−3'));
  assert.ok(html.includes('<b>0</b> families, <b>0</b> themes'));
  assert.deepEqual(JSON.parse(dataBlock(html)), { families: [], hero: [] });
});

test('families are listed by the day they were added, then by slug, before the vacant card', () => {
  const page = renderLandingPage(
    index([entry('mango', '2026-03-01'), entry('zinc', '2026-01-05'), entry('apple', '2026-03-01'), entry('birch', '2026-02-01')]),
  );
  const order = [...page.matchAll(/data-family="([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(order, ['zinc', 'birch', 'apple', 'mango']);
  assert.ok(page.indexOf('data-family="mango"') < page.indexOf('Yours could be next.'));
  assert.ok(!/No\. \d{3}/.test(page), 'families are not numbered');
});

test('a family with no previews, as with an older validator, still renders', async () => {
  const root = makeGallery({ example: {} });
  const { html } = await build(root);
  assert.ok(html.includes('data-family="example"'));
  assert.ok(!html.includes('class="sweep"'), 'no frame without a preview to paint');
  assert.match(html, /<h3 id="t-example">Example<\/h3>/);
  assert.ok(html.includes('Catalog updated 2026-11-01'));
  assert.ok(!html.includes('checked with Kepler none'));
  const data = JSON.parse(dataBlock(html));
  assert.equal(data.families[0].themes[0].preview, null);
  assert.deepEqual(data.hero, []);
});

test('previews stay out of the index the Kepler app reads', async () => {
  const root = makeGallery({ example: { family: validFamily({ themes: [{ id: 'example-dark', name: 'Example Dark', extends: 'dark' }] }) } });
  withVendor(root, { 'example-dark': preview('dark') });
  const { outDir } = await build(root);
  const written = readFileSync(join(outDir, 'v1', 'index.json'), 'utf8');
  assert.equal(JSON.stringify(JSON.parse(written)), JSON.stringify(await buildIndex({ root, now: NOW })));
  assert.ok(!written.includes('"preview"'));
});

test('a family with a painted dark and light theme sweeps; one with a single polarity does not', async () => {
  const pair = validFamily({
    name: 'Pair',
    themes: [
      { id: 'pair-dark', name: 'Pair Night', extends: 'dark' },
      { id: 'pair-light', name: 'Pair Day', extends: 'light' },
    ],
  });
  const trio = validFamily({
    name: 'Trio',
    themes: [
      { id: 'trio-a', name: 'Trio A', extends: 'dark' },
      { id: 'trio-b', name: 'Trio B', extends: 'dark' },
      { id: 'trio-c', name: 'Trio C', extends: 'light' },
    ],
  });
  const root = makeGallery({ pair: { family: pair }, trio: { family: trio }, solo: {} });
  withVendor(root, {
    'pair-dark': preview('dark', '#111111'),
    'pair-light': preview('light', '#eeeeee'),
    'trio-a': preview('dark'),
    'trio-b': preview('dark'),
    'example-dark': preview('dark'),
  });
  const { html } = await build(root);
  const card = (slug) => {
    const start = html.indexOf(`data-family="${slug}"`);
    return html.slice(start, html.indexOf('</article>', start));
  };
  assert.match(card('pair'), /<button type="button" class="sweep"/);
  // Trio's light theme has no preview, so the family has only dark pictures to show.
  assert.match(card('trio'), /<div class="sweep" role="img" aria-label="Trio A preview">/);
  assert.ok(!card('trio').includes('<button type="button" class="sweep"'));
  assert.match(card('solo'), /<div class="sweep"/);

  // One dot per painted theme, named for it and colored from its preview, pointing at its place in the family.
  const dots = (slug) => [...card(slug).matchAll(/<button type="button" data-index="(\d+)" aria-label="([^"]+)"[^>]*><i style="([^"]+)"><\/i><\/button>/g)].map((m) => [m[1], m[2], m[3]]);
  assert.deepEqual(dots('pair'), [
    ['0', 'Show Pair Night', 'background:linear-gradient(135deg,#111111 50%,#111111 50%)'],
    ['1', 'Show Pair Day', 'background:linear-gradient(135deg,#eeeeee 50%,#eeeeee 50%)'],
  ]);
  assert.deepEqual(dots('trio').map((d) => d[0]), ['0', '1']);
  for (const removed of ['class="seg" role="group" aria-label="Pair variant"', 'class="readout"', 'class="spectrum"', 'class="orb"', 'class="tags"', 'class="no"', 'An example.']) {
    assert.ok(!html.includes(removed), `${removed} is not on the card`);
  }
});

test('family color extras are kept only as a hex or plain oklch() color', () => {
  const valid = {
    ai: 'oklch(0.76 0.17 315)',
    'diff-added': 'oklch(0.48 0.155 142 / 0.5)',
    'diff-removed': '#ff836e0b',
    'scrollbar-thumb': '#8A65B8',
    'edge-strong': 'oklch(.5 1 20)',
  };
  assert.deepEqual(validExtras({ ...valid, 'surface-canvas': '#000000', brand: '#123456' }), valid, 'only the five tokens the window paints');
  const hostile = {
    ai: 'url(https://x)',
    'diff-added': 'red;background:url(https://evil.example/x)',
    'diff-removed': 'var(--x)',
    'scrollbar-thumb': 'oklch(1 2 3) x',
    'edge-strong': 0.45,
  };
  assert.deepEqual(validExtras(hostile), {});
  for (const odd of ['#abc', '#1234567', 'oklch(1 2)', 'oklch(1 2 3 4)', 'oklch(1 2 3 / 4 5)', 'OKLCH(1 2 3)x', 'rgb(1 2 3)', 'red', ' #123456', '#123456\n', 'oklch(-1 2 3)']) {
    assert.deepEqual(validExtras({ ai: odd }), {}, `${JSON.stringify(odd)} is dropped`);
  }
  for (const odd of [null, 'x', ['#123456'], 1]) assert.deepEqual(validExtras(odd), {});

  const family = entry('a', '2026-01-01');
  family.family.themes[0].colors = { ...hostile, ai: '#0dcfb2', 'diff-added': 'oklch(0.48 0.155 142 / 0.5)' };
  const html = renderLandingPage(index([family]), { a: { 'a-dark': preview('dark') } });
  assert.ok(!html.includes('url(') && !html.includes('evil.example') && !html.includes('var(--x)') && !html.includes('2 3) x'));
  assert.deepEqual(JSON.parse(dataBlock(html)).families[0].themes[0].extras, { ai: '#0dcfb2', 'diff-added': 'oklch(0.48 0.155 142 / 0.5)' });
});

test('the hero shows at most six painted themes, featured families first', () => {
  const families = ['a', 'b', 'c', 'd'].map((slug, i) =>
    entry(slug, `2026-01-0${i + 1}`, {
      ...(slug === 'd' ? { featured: 1 } : {}),
      family: validFamily({
        name: slug,
        themes: [
          { id: `${slug}-dark`, name: 'D', extends: 'dark' },
          { id: `${slug}-light`, name: 'L', extends: 'light' },
        ],
      }),
    }),
  );
  const previews = Object.fromEntries(families.map((f) => [f.slug, { [`${f.slug}-dark`]: preview('dark'), [`${f.slug}-light`]: preview('light') }]));
  const data = JSON.parse(dataBlock(renderLandingPage(index(families), previews)));
  assert.equal(data.hero.length, 6);
  assert.deepEqual(data.hero.slice(0, 2), [{ slug: 'd', id: 'd-dark' }, { slug: 'd', id: 'd-light' }]);
  assert.deepEqual(data.hero.slice(2).map((h) => h.slug), ['a', 'a', 'b', 'b']);
});

test('the build copies every file the page loads and requests nothing from another host', async () => {
  const { outDir, html } = await build(makeGallery({ example: {} }));
  const urls = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((m) => m[1]).filter((u) => !u.startsWith('#'));
  const css = ['site.css', 'brand/kep.css'].map((f) => readFileSync(join(outDir, f), 'utf8')).join('\n');
  urls.push(...[...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]));
  assert.ok(urls.includes('site.js') && urls.includes('brand/kep.js') && urls.includes('fonts/dm-sans.woff2'));
  for (const url of urls) {
    if (/^https:\/\/github\.com\/gitkraken\/kepler-themes/.test(url) || url === DOWNLOAD_URL) continue;
    assert.ok(!/^[a-z][a-z0-9+.-]*:|^\/\//i.test(url), `${url} is relative`);
    assert.ok(existsSync(join(outDir, url)), `${url} exists in the output`);
  }
  for (const license of ['OFL-bricolagegrotesque.txt', 'OFL-dmsans.txt', 'OFL-jetbrainsmono.txt']) {
    assert.ok(existsSync(join(outDir, 'fonts', license)));
  }
});

test('the page footer links the index and states the catalog date', async () => {
  const root = makeGallery({ example: {} });
  withVendor(root, {});
  const { html } = await build(root);
  assert.ok(html.includes('Catalog updated 2026-11-01, checked with Kepler 9.9.9'));
  assert.ok(html.includes('<a href="v1/index.json">Index (JSON)</a>'));
});

test('a visitor without Kepler is told what it is and where to download it', () => {
  const html = renderLandingPage(index([]));
  assert.ok(html.includes("GitKraken's agent-agnostic development environment"));
  assert.ok(html.includes(`<a class="btn primary" href="${DOWNLOAD_URL}">Build yours in Kepler</a>`));
  assert.ok(html.includes(`<a class="get" href="${DOWNLOAD_URL}">Get Kepler</a>`));
  assert.ok(html.includes('<a href="#launch">See how to submit it'), 'the hero links down to submitting');
  assert.ok(html.includes('<meta property="og:title" content="Kepler Themes">'));
  assert.ok(html.includes(`<meta property="og:url" content="${SITE_URL}">`));
});

test('the data block carries what the catalog search and the cards need', () => {
  const families = [entry('a', '2026-01-01', { name: 'Aurora', tags: ['green', 'cool'] })];
  families[0].family.themes.push({ id: 'a-light', name: 'a Light', extends: 'light' });
  const html = renderLandingPage(index(families), { a: { 'a-dark': preview('dark') } });
  const [family] = JSON.parse(dataBlock(html)).families;
  assert.equal(family.name, 'Aurora');
  assert.deepEqual(family.tags, ['green', 'cool']);
  assert.deepEqual(family.themes.map((t) => t.polarity), ['dark', 'light']);
  assert.deepEqual(Object.keys(family.themes[0]), ['id', 'name', 'polarity', 'preview', 'extras']);
  assert.equal(family.themes[1].preview, null);
  assert.deepEqual(family.themes[0].extras, {});
  assert.ok(html.includes('<div class="filters" hidden>'), 'the controls wait for the script');
  assert.ok(html.includes('<div class="find" role="search" aria-label="Themes">'));
  assert.match(html, /<button type="button" aria-pressed="false" data-mode="dark">All dark<\/button>\s*<button type="button" aria-pressed="true" data-mode="split">50\/50<\/button>\s*<button type="button" aria-pressed="false" data-mode="light">All light<\/button>/);
});
