import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { buildIndex, buildSite } from '../build-index.mjs';
import { DOWNLOAD_URL, SITE_URL, renderLandingPage } from '../lib/landing-page.mjs';
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

test('a preview with a value that is not a hex color is dropped and the family renders without a window', async () => {
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
  assert.ok(!badCard.includes('class="win"'));
  assert.ok(goodCard.includes('class="win"'));
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
  assert.ok(!page.includes('class="win"'));
  for (const odd of [shaped, missing]) {
    assert.ok(!renderLandingPage(index([entry('a', '2026-01-01')]), { a: { 'a-dark': odd } }).includes('class="win"'));
  }
});

test('an empty gallery still renders the hero, the vacant card and the countdown', async () => {
  const { html } = await build(makeGallery({}));
  assert.ok(html.includes('id="system"'));
  assert.ok(html.includes('No. 001 is waiting.'));
  assert.ok(html.includes('T−3'));
  assert.ok(html.includes('<b>0</b> families, <b>0</b> themes'));
  assert.deepEqual(JSON.parse(dataBlock(html)), { families: [], hero: [] });
});

test('families are numbered by the day they were added, then by slug', () => {
  const page = renderLandingPage(
    index([entry('mango', '2026-03-01'), entry('zinc', '2026-01-05'), entry('apple', '2026-03-01'), entry('birch', '2026-02-01')]),
  );
  const order = [...page.matchAll(/data-family="([a-z]+)"[\s\S]*?<span class="no">No\. (\d{3})<\/span>/g)].map((m) => `${m[2]} ${m[1]}`);
  assert.deepEqual(order, ['001 zinc', '002 birch', '003 apple', '004 mango']);
  assert.ok(page.includes('No. 005 is waiting.'));
});

test('a family with no previews, as with an older validator, still renders', async () => {
  const root = makeGallery({ example: {} });
  const { html } = await build(root);
  assert.ok(html.includes('data-family="example"'));
  assert.ok(html.includes('No. 001'));
  assert.ok(!html.includes('class="win"'));
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

test('a dark and light pair is labelled Dark and Light, other families use theme names', async () => {
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
  withVendor(root, { 'pair-dark': preview('dark'), 'pair-light': preview('light'), 'trio-a': preview('dark') });
  const { html } = await build(root);
  const card = (slug) => {
    const start = html.indexOf(`data-family="${slug}"`);
    return html.slice(start, html.indexOf('</article>', start));
  };
  assert.match(card('pair'), /<button type="button" aria-pressed="true" data-index="0">Dark<\/button>/);
  assert.match(card('pair'), /<button type="button" aria-pressed="false" data-index="1">Light<\/button>/);
  assert.match(card('pair'), /<dt>Themes<\/dt><dd>Dark, Light<\/dd>/);
  assert.match(card('trio'), />Trio A<\/button>/);
  assert.match(card('trio'), /<dt>Themes<\/dt><dd>3<\/dd>/);
  assert.ok(!card('solo').includes('class="seg"'), 'one theme needs no switch');
  assert.match(card('pair'), /role="img" aria-label="Pair Night preview"/);
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
