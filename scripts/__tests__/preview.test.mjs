import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { collectPreviews } from '../build-index.mjs';
import { changedSlugsOf } from '../check.mjs';
import { findChrome } from '../lib/chrome.mjs';
import { loadGallery } from '../lib/gallery.mjs';
import {
  MAX_SHOTS,
  buildEntries,
  buildManifest,
  drawable,
  parseArgs,
  planShots,
  resetOutDir,
  writePreviews,
} from '../preview.mjs';
import { makeGallery, validFamily } from './helpers.mjs';

const TOOLING_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

function preview(color = '#336699', polarity = 'dark') {
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

function themesOf(count) {
  return Array.from({ length: count }, (_, i) => ({ id: `t-${i}`, name: `T ${i}`, extends: 'dark' }));
}

test('changed slugs are the families whose files changed', () => {
  assert.deepEqual(
    [...changedSlugsOf(['themes/gamma/gamma.json', 'themes/alpha/gallery.json', 'themes/alpha/alpha.json'])],
    ['gamma', 'alpha'],
  );
});

test('changed slugs ignore other files and bare folder names', () => {
  assert.deepEqual([...changedSlugsOf(['README.md', 'scripts/preview.mjs', '.github/workflows/check.yml', 'themes/alpha'])], []);
  assert.deepEqual([...changedSlugsOf([])], []);
  assert.equal(changedSlugsOf(null), null);
});

test('a folder or theme named after an Object property stays in the previews and reaches nothing else', async () => {
  const vendor = { checkThemeFamily: async () => ({ themes: [{ id: 'keys', preview: { a: 1 } }, { id: 'polluted', preview: { a: 1 } }] }) };
  const families = ['constructor', '__proto__'].map((slug) => ({ slug, family: { text: '{}' } }));
  const previews = await collectPreviews({ families, vendor });
  assert.equal(typeof Object.keys, 'function');
  assert.equal({}.polluted, undefined);
  assert.deepEqual(previews.constructor.keys, { a: 1 });
  assert.deepEqual(previews['__proto__'].polluted, { a: 1 });
});

test('a name or author that is not a string falls back instead of breaking the page', () => {
  const family = { ...validFamily(), name: { toString: 1 }, author: { valueOf: 1, toString: 1 } };
  const [entry] = buildEntries([{ slug: 'odd', family: { value: family }, gallery: {} }]);
  assert.equal(entry.name, 'odd');
  assert.equal(entry.author, '');
});

test('entries come straight from the files, with no tags when gallery.json is unusable', () => {
  const root = makeGallery({
    fine: {},
    broken: { gallery: '{ not json' },
    wrong: { gallery: '["a"]' },
    missing: {},
    notobject: { family: '[1]' },
  });
  const { families } = loadGallery(root);
  const entries = buildEntries(drawable(families));
  assert.deepEqual(entries.map((e) => e.slug), ['broken', 'fine', 'missing', 'wrong'], 'a family file that is not an object is left out');
  const by = Object.fromEntries(entries.map((e) => [e.slug, e]));
  assert.deepEqual(by.fine, {
    slug: 'fine', name: 'Example', author: 'Ada', tags: ['blue'], version: '1.0.0', family: validFamily(),
  });
  assert.deepEqual(by.broken.tags, []);
  assert.deepEqual(by.wrong.tags, []);
});

test('a screenshot is planned for each theme that has a preview, numbered as the page numbers its dots', () => {
  const families = [
    { slug: 'one', family: { value: { name: 'One', themes: [{ id: 'a', name: 'A' }, 'junk', { name: 'no id' }, { id: 'b' }] } } },
  ];
  const previews = { one: { a: preview(), b: preview() } };
  const { shots, truncated } = planShots(families, previews);
  assert.equal(truncated, false);
  assert.deepEqual(shots, [
    { slug: 'one', family: 'One', index: 0, theme: 'A', themeId: 'a', polarity: 'dark' },
    { slug: 'one', family: 'One', index: 1, theme: 'b', themeId: 'b', polarity: 'dark' },
  ]);
});

test("each family's screenshots are ordered in dark and light pairs, its leftovers last", () => {
  const themes = ['d1', 'd2', 'd3', 'l1', 'l2'].map((id) => ({ id, name: id.toUpperCase() }));
  const families = [
    { slug: 'one', family: { value: { name: 'One', themes } } },
    { slug: 'two', family: { value: { name: 'Two', themes: [{ id: 'l1' }, { id: 'd1' }] } } },
  ];
  const kind = (id) => (id.startsWith('d') ? 'dark' : 'light');
  const previews = {
    one: Object.fromEntries(themes.map((t) => [t.id, preview('#336699', kind(t.id))])),
    two: { l1: preview('#336699', 'light'), d1: preview('#336699', 'dark') },
  };
  const { shots } = planShots(families, previews);
  assert.deepEqual(shots.map((s) => `${s.slug} ${s.themeId} ${s.index} ${s.polarity}`), [
    'one d1 0 dark', 'one l1 3 light', 'one d2 1 dark', 'one l2 4 light', 'one d3 2 dark',
    'two d1 1 dark', 'two l1 0 light',
  ]);
  // The polarity is the validator's, not the theme's `extends`.
  const claimed = [{ slug: 'x', family: { value: { name: 'X', themes: [{ id: 'a', extends: 'light' }] } } }];
  assert.equal(planShots(claimed, { x: { a: preview() } }).shots[0].polarity, 'dark');
});

test('themes without a valid preview get no screenshot', () => {
  const families = [{ slug: 'one', family: { value: { name: 'One', themes: [{ id: 'a' }, { id: 'b' }] } } }];
  const { shots } = planShots(families, { one: { a: preview(), b: { polarity: 'dark' } } });
  assert.deepEqual(shots.map((s) => s.themeId), ['a']);
});

test('at most 24 screenshots are planned, and the cut is reported', () => {
  const families = ['one', 'two', 'three'].map((slug) => ({ slug, family: { value: { name: slug, themes: themesOf(10) } } }));
  const previews = Object.fromEntries(families.map((f) => [f.slug, Object.fromEntries(themesOf(10).map((t) => [t.id, preview()]))]));
  const { shots, truncated } = planShots(families, previews);
  assert.equal(MAX_SHOTS, 24);
  assert.equal(shots.length, 24);
  assert.equal(truncated, true);
  assert.deepEqual(shots.at(-1), { slug: 'three', family: 'three', index: 3, theme: 'T 3', themeId: 't-3', polarity: 'dark' });
  assert.equal(planShots(families, previews, 30).truncated, false);
});

test('the manifest names files by number, never by contributor text', () => {
  const manifest = buildManifest([
    { slug: 's', family: 'Fam', index: 0, theme: '../../x.png', themeId: 'a', polarity: 'dark' },
    { slug: 's', family: 'Fam', index: 1, theme: 'B', themeId: 'b', polarity: 'light' },
  ]);
  assert.deepEqual(manifest, {
    previews: [
      { file: '1.png', slug: 's', family: 'Fam', theme: '../../x.png', themeId: 'a', polarity: 'dark' },
      { file: '2.png', slug: 's', family: 'Fam', theme: 'B', themeId: 'b', polarity: 'light' },
    ],
  });
  assert.deepEqual(buildManifest([]), { previews: [] });
  assert.deepEqual(buildManifest([], { truncated: true }), { previews: [], truncated: true });
});

test('the output folder is only emptied when it holds nothing but a previous preview', () => {
  const parent = mkdtempSync(join(tmpdir(), 'kepler-themes-out-'));
  const previous = join(parent, 'previous');
  mkdirSync(previous);
  for (const name of ['1.png', '12.png', 'manifest.json']) writeFileSync(join(previous, name), 'x');
  resetOutDir(previous);
  assert.deepEqual(readdirSync(previous), []);

  const other = join(parent, 'other');
  mkdirSync(join(other, 'photos'), { recursive: true });
  writeFileSync(join(other, '1.png'), 'x');
  assert.throws(() => resetOutDir(other), /Refusing to empty .*photos/);
  assert.deepEqual(readdirSync(other).sort(), ['1.png', 'photos']);

  const fresh = join(parent, 'fresh', 'preview');
  resetOutDir(fresh);
  assert.ok(existsSync(fresh));
});

test('arguments default to origin/main and ./preview, and unknown ones throw', () => {
  const args = parseArgs([]);
  assert.equal(args.base, 'origin/main');
  assert.equal(args.out, join(process.cwd(), 'preview'));
  assert.equal(args.root, process.cwd());
  assert.deepEqual(parseArgs(['--root', '/r', '--base', 'x', '--out', '/o']), { root: '/r', base: 'x', out: '/o' });
  assert.throws(() => parseArgs(['--nope']), /Unknown argument --nope/);
  assert.throws(() => parseArgs(['--base']), /--base needs a value/);
  assert.throws(() => parseArgs(['--out', '']), /--out needs a value/);
});

test('findChrome honors CHROME_PATH and says nothing was found when it is wrong', () => {
  assert.equal(findChrome({ env: { CHROME_PATH: process.execPath } }), process.execPath);
  assert.equal(findChrome({ env: { CHROME_PATH: '/no/such/chrome' } }), null);
  assert.equal(findChrome({ env: { PATH: '/no/such/dir' }, platform: 'linux' }), null);
});

test('screenshots of a real page are PNGs, one per variant, listed in the manifest', { skip: findChrome() ? false : 'Chrome is not installed' }, async () => {
  const root = makeGallery({
    sample: { family: validFamily({ themes: [
      { id: 'sample-light', name: 'Sample Light', extends: 'light' },
      { id: 'sample-dark', name: 'Sample Dark', extends: 'dark' },
    ] }) },
    // Two dark themes and no light one: the window has a single layer, which each dot repaints.
    solo: { family: validFamily({ name: 'Solo', themes: [
      { id: 'solo-dark', name: 'Solo Dark', extends: 'dark' },
      { id: 'solo-ember', name: 'Solo Ember', extends: 'dark', colors: { brand: '#ff3366', 'surface-canvas': '#202020' } },
    ] }) },
  });
  const outDir = join(mkdtempSync(join(tmpdir(), 'kepler-themes-out-')), 'preview');
  const manifest = await writePreviews({ families: loadGallery(root).families, outDir, toolingRoot: TOOLING_ROOT, log: () => {} });
  assert.deepEqual(JSON.parse(readFileSync(join(outDir, 'manifest.json'), 'utf8')), manifest);
  assert.deepEqual(manifest.previews.map((p) => [p.file, p.themeId, p.polarity]), [
    ['1.png', 'sample-dark', 'dark'],
    ['2.png', 'sample-light', 'light'],
    ['3.png', 'solo-dark', 'dark'],
    ['4.png', 'solo-ember', 'dark'],
  ]);
  const bytes = manifest.previews.map((p) => readFileSync(join(outDir, p.file)));
  for (const png of bytes) {
    assert.deepEqual([...png.subarray(0, 8)], [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    // The window at the default viewport, at 2x: about 1100 pixels wide, in its 760 by 500 shape.
    const [width, height] = [png.readUInt32BE(16), png.readUInt32BE(20)];
    assert.ok(width >= 1050 && width <= 1250, `${width} pixels wide`);
    assert.ok(Math.abs(height / width - 500 / 760) < 0.01, `${width} by ${height} is the window's shape`);
  }
  assert.notDeepEqual(bytes[0], bytes[1], 'each variant is drawn in its own colors');
  assert.notDeepEqual(bytes[2], bytes[3], 'a family of one polarity repaints its window for each variant');
});

test('a folder name with quotes is matched as text, never run as script', { skip: findChrome() ? false : 'Chrome is not installed' }, async () => {
  const slugs = ["it's", "a'+(document.title='x')+'"];
  const root = makeGallery(Object.fromEntries(slugs.map((slug) => [slug, { family: validFamily() }])));
  const outDir = join(mkdtempSync(join(tmpdir(), 'kepler-themes-out-')), 'preview');
  const manifest = await writePreviews({ families: loadGallery(root).families, outDir, toolingRoot: TOOLING_ROOT, log: () => {} });
  assert.deepEqual(manifest.previews.map((p) => p.slug).sort(), [...slugs].sort());
});

test('with no drawable theme, nothing is launched and the manifest is empty', async () => {
  const root = makeGallery({ sample: { family: validFamily({ themes: [] }) } });
  const outDir = join(mkdtempSync(join(tmpdir(), 'kepler-themes-out-')), 'preview');
  const manifest = await writePreviews({ families: loadGallery(root).families, outDir, toolingRoot: TOOLING_ROOT, log: () => {} });
  assert.deepEqual(manifest, { previews: [] });
  assert.ok(existsSync(join(outDir, 'manifest.json')));
});
