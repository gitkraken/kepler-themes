import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { buildIndex, serializeIndex } from '../build-index.mjs';
import { canonicalHash } from '../lib/canonical-hash.mjs';
import { MAX_INDEX_BYTES, formatJson } from '../lib/gallery.mjs';
import { makeGallery, validFamily } from './helpers.mjs';

const NOW = new Date('2026-11-01T12:00:00Z');

test('index has the shape Kepler reads', async () => {
  const other = validFamily({ name: 'Other', themes: [{ id: 'other-dark', name: 'O', extends: 'dark' }] });
  const root = makeGallery(
    { zeta: { family: other }, example: {}, },
    { featured: ['zeta'], withdrawn: ['gone'] },
  );
  const index = await buildIndex({ root, now: NOW });
  assert.deepEqual(Object.keys(index), ['indexVersion', 'generatedAt', 'checkedWith', 'families', 'withdrawn']);
  assert.equal(index.indexVersion, 1);
  assert.equal(index.generatedAt, '2026-11-01T12:00:00.000Z');
  assert.equal(index.checkedWith, 'none');
  assert.deepEqual(index.withdrawn, ['gone']);
  assert.deepEqual(index.families.map((f) => f.slug), ['example', 'zeta'], 'sorted by slug');
  const [example, zeta] = index.families;
  assert.equal(example.featured, undefined);
  assert.equal('featured' in example, false);
  assert.equal(zeta.featured, 1);
  assert.deepEqual(example.maintainers, ['ada']);
  assert.deepEqual(example.tags, ['blue']);
  assert.equal(example.schemaVersion, 1);
  assert.equal(example.version, '1.0.0');
  assert.equal(example.addedAt, '2026-11-01', 'no history falls back to the build date');
  assert.deepEqual(example.versions, {});
  assert.equal(example.sha256, canonicalHash(example.family));
  assert.deepEqual(example.family, validFamily());
});

test('versions, addedAt and updatedAt come from the family file history', async () => {
  const root = makeGallery({ example: {} });
  const path = join(root, 'themes', 'example', 'example.json');
  const git = (args, date) =>
    execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], {
      cwd: root,
      env: { ...process.env, GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date },
      stdio: 'ignore',
    });
  git(['init', '-q', '-b', 'main'], '2026-01-01T00:00:00Z');
  const release = (version, date) => {
    writeFileSync(path, formatJson(validFamily({ version })));
    git(['add', '-A'], date);
    git(['commit', '-q', '-m', version], date);
  };
  release('1.0.0', '2026-01-02T10:00:00Z');
  release('1.1.0', '2026-02-03T10:00:00Z');
  release('1.2.0', '2026-03-04T10:00:00Z');
  const [family] = (await buildIndex({ root, now: NOW })).families;
  assert.equal(family.addedAt, '2026-01-02');
  assert.equal(family.updatedAt, '2026-03-04');
  assert.deepEqual(family.versions, {
    '1.1.0': canonicalHash(validFamily({ version: '1.1.0' })),
    '1.0.0': canonicalHash(validFamily({ version: '1.0.0' })),
  });
  assert.equal('1.2.0' in family.versions, false, 'the current version is excluded');
});

test('the index build fails on layout or format problems', async () => {
  const root = makeGallery({ example: { family: JSON.stringify(validFamily()) } });
  await assert.rejects(buildIndex({ root, now: NOW }), /not formatted canonically/);
  const extra = makeGallery({ example: { extra: { 'preview.png': 'x' } } });
  await assert.rejects(buildIndex({ root: extra, now: NOW }), /Unexpected file preview\.png/);
});

test('addedAt and updatedAt use the committer date, not the author date', async () => {
  const root = makeGallery({ example: {} });
  const path = join(root, 'themes', 'example', 'example.json');
  const git = (args, env = {}) =>
    execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], {
      cwd: root,
      env: { ...process.env, ...env },
      stdio: 'ignore',
    });
  git(['init', '-q', '-b', 'main']);
  const release = (version, author, committer) => {
    writeFileSync(path, formatJson(validFamily({ version })));
    git(['add', '-A']);
    git(['commit', '-q', '-m', version], { GIT_AUTHOR_DATE: author, GIT_COMMITTER_DATE: committer });
  };
  release('1.0.0', '2020-01-01T00:00:00Z', '2026-05-05T10:00:00Z');
  // 23:30 at UTC-5 is already the next day in UTC.
  release('1.1.0', '2020-02-02T00:00:00Z', '2026-06-06T23:30:00-05:00');
  const [family] = (await buildIndex({ root, now: NOW })).families;
  assert.equal(family.addedAt, '2026-05-05');
  assert.equal(family.updatedAt, '2026-06-07');
  assert.match(family.addedAt, /^\d{4}-\d{2}-\d{2}$/);
});

test('the index build refuses a gallery the Kepler app would drop', async () => {
  const families = {};
  for (let i = 0; i < 501; i++) {
    families[`f${i}`] = { family: validFamily({ themes: [{ id: `f${i}-dark`, name: 'F', extends: 'dark' }] }) };
  }
  await assert.rejects(buildIndex({ root: makeGallery(families), now: NOW }), /501 families.*more than 500/);

  const big = { families: [{}], padding: 'x'.repeat(MAX_INDEX_BYTES) };
  assert.throws(() => serializeIndex(big), /drops an index over 8388608/);
  assert.ok(serializeIndex({ families: [{}] }).endsWith('\n'));
  const many = { families: Array.from({ length: 501 }, () => ({})) };
  assert.throws(() => serializeIndex(many), /more than 500/);
});

test('the index build names an unreadable or malformed file instead of crashing', async () => {
  const huge = validFamily({ themes: [{ id: 'big-dark', name: 'B', extends: 'dark', padding: 'x'.repeat(1_100_000) }] });
  await assert.rejects(buildIndex({ root: makeGallery({ big: { family: huge } }), now: NOW }), /big: big\.json cannot be read: larger than 1 MB/);
  await assert.rejects(
    buildIndex({ root: makeGallery({ odd: { gallery: 'null\n' } }), now: NOW }),
    /odd: odd\/gallery\.json must be a JSON object with maintainers and tags arrays/,
  );
  await assert.rejects(buildIndex({ root: makeGallery({ odd: { family: '[]\n' } }), now: NOW }), /odd: odd\.json must be a JSON object/);
  const list = makeGallery({ example: {} });
  writeFileSync(join(list, 'tags.json'), formatJson(['x'.repeat(1_100_000)]));
  writeFileSync(join(list, 'withdrawn.json'), formatJson(['x'.repeat(1_100_000)]));
  await assert.rejects(buildIndex({ root: list, now: NOW }), /withdrawn\.json cannot be read: larger than 1 MB/);
});
