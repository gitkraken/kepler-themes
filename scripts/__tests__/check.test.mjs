import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmdirSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { test } from 'node:test';
import { SCOPE_MIXED, SCOPE_WARNING, renderMarkdown, renderText, runChecks } from '../check.mjs';
import { fixFormatting, formatJson, plain } from '../lib/gallery.mjs';
import { globalProblemsOf, makeGallery, problemsOf, validFamily } from './helpers.mjs';

const run = (root, options = {}) => runChecks({ root, ...options });

test('a clean gallery passes', async () => {
  const root = makeGallery({ example: {} });
  const report = await run(root);
  assert.equal(report.failed, false, renderText(report));
  assert.match(report.notes[0], /every family is treated as new/);
  assert.match(renderMarkdown(report), /Theme checks: passed/);
});

test('layout rejects a bad slug, extra files and missing files', async () => {
  const root = makeGallery({
    Bad_Slug: {},
    extra: {},
  });
  // A stray image beside the two files.
  writeFileSync(join(root, 'themes', 'extra', 'preview.png'), 'x');
  const report = await run(root);
  assert.match(problemsOf(report, 'Bad_Slug', 'Layout')[0], /Folder name/);
  assert.match(problemsOf(report, 'extra', 'Layout').join(' '), /Unexpected file preview\.png/);
  const missing = makeGallery({ lonely: {} });
  writeFileSync(join(missing, 'themes', 'lonely', 'other.json'), '{}');
  const r2 = await run(missing);
  assert.match(problemsOf(r2, 'lonely', 'Layout').join(' '), /other\.json/);
});

test('format rejects comments and non-canonical text, and --fix repairs the latter', async () => {
  const root = makeGallery({
    spaced: { family: JSON.stringify(validFamily()) },
    commented: { family: '{ // hi\n "name": "x" }' },
  });
  const report = await run(root);
  assert.match(problemsOf(report, 'spaced', 'Format')[0], /not formatted canonically/);
  assert.match(problemsOf(report, 'commented', 'Format')[0], /not plain JSON/);
  fixFormatting(root);
  const after = await run(root);
  assert.deepEqual(problemsOf(after, 'spaced', 'Format'), []);
  assert.match(problemsOf(after, 'commented', 'Format')[0], /not plain JSON/);
});

test('envelope enforces required fields, licenses and known keys', async () => {
  const root = makeGallery({
    weak: {
      family: validFamily({
        license: 'GPL-3.0',
        description: undefined,
        author: undefined,
        version: 'one',
        basedOn: 'x',
        homepage: 'http://example.com',
        schemaVersion: 2,
      }),
    },
  });
  const text = problemsOf(await run(root), 'weak', 'Envelope').join('\n');
  for (const part of ['schemaVersion', 'version is required', 'license is required', 'description is required', 'author is required', '"basedOn"', 'homepage']) {
    assert.ok(text.includes(part), part);
  }
});

test('version rule: a changed file must outrank the base, an unchanged one passes, a new one is free', async () => {
  const base = validFamily({ version: '1.4.2' });
  const baseText = JSON.stringify(base);
  const check = async (family) => {
    const root = makeGallery({ example: { family } });
    const report = await run(root, { base: 'origin/main', readBase: () => baseText });
    return problemsOf(report, 'example', 'Version');
  };
  assert.deepEqual(await check(base), []);
  const changed = (version) => validFamily({ version, description: 'Changed.' });
  const failure = await check(changed('1.4.2'));
  assert.equal(failure[0], 'Raise version above 1.4.2 to publish this change (it is 1.4.2 now).');
  assert.equal((await check(changed('1.4.1'))).length, 1);
  assert.equal((await check(changed('1.4.3-rc.1'))).length, 0);
  assert.equal((await check(changed('2.0.0'))).length, 0);
  assert.equal((await check(changed('1.4.2-rc.1'))).length, 1, 'a prerelease ranks below its release');
  const root = makeGallery({ example: { family: changed('0.0.1') } });
  const fresh = await run(root, { base: 'origin/main', readBase: () => null });
  assert.deepEqual(problemsOf(fresh, 'example', 'Version'), [], 'a new family may start anywhere');
});

test('ids must be unique across the gallery and names may not impersonate', async () => {
  const root = makeGallery({
    one: { family: validFamily({ name: 'Kepler Blue' }) },
    two: { family: validFamily({ name: 'Two' }) },
    three: { family: validFamily({ name: 'GITKRAKEN Glow', themes: [{ id: 'three-dark', name: 'x', extends: 'dark' }] }) },
  });
  const report = await run(root);
  assert.match(problemsOf(report, 'one', 'Ids')[0], /already used by "two"/);
  assert.match(problemsOf(report, 'two', 'Ids')[0], /already used by "one"/);
  assert.match(problemsOf(report, 'one', 'Names')[0], /reserved/);
  assert.match(problemsOf(report, 'three', 'Names')[0], /reserved/);
  assert.deepEqual(problemsOf(report, 'three', 'Ids'), []);
});

test('gallery.json needs maintainers, known tags and no extra keys', async () => {
  const root = makeGallery({
    bad: { gallery: { maintainers: [], tags: ['blue', 'nope', 'a', 'b', 'c', 'd'], extra: 1 } },
    good: { gallery: { maintainers: ['ada-l'], tags: [] }, family: validFamily({ themes: [{ id: 'good-dark', name: 'G', extends: 'dark' }] }) },
    login: { gallery: { maintainers: ['-bad-'], tags: [] }, family: validFamily({ themes: [{ id: 'login-dark', name: 'L', extends: 'dark' }] }) },
  });
  const report = await run(root);
  const text = problemsOf(report, 'bad', 'Gallery data').join('\n');
  for (const part of ['1 to 20', 'limit is 5', '"nope"', '"extra"']) assert.ok(text.includes(part), part);
  assert.deepEqual(problemsOf(report, 'good', 'Gallery data'), []);
  assert.match(problemsOf(report, 'login', 'Gallery data')[0], /not a GitHub login/);
});

test('maintainers are 1 to 20 distinct logins, ignoring case', async () => {
  const many = Array.from({ length: 21 }, (_, i) => `user-${i}`);
  const root = makeGallery({
    many: { gallery: { maintainers: many, tags: [] }, family: validFamily({ themes: [{ id: 'many-dark', name: 'M', extends: 'dark' }] }) },
    twenty: { gallery: { maintainers: many.slice(0, 20), tags: [] }, family: validFamily({ themes: [{ id: 'twenty-dark', name: 'T', extends: 'dark' }] }) },
    dupe: { gallery: { maintainers: ['Ada-L', 'ada-l'], tags: [] }, family: validFamily({ themes: [{ id: 'dupe-dark', name: 'D', extends: 'dark' }] }) },
  });
  const report = await run(root);
  assert.match(problemsOf(report, 'many', 'Gallery data')[0], /1 to 20/);
  assert.deepEqual(problemsOf(report, 'twenty', 'Gallery data'), []);
  assert.match(problemsOf(report, 'dupe', 'Gallery data')[0], /repeats a login/);
});

test('a family file over 1 MB fails the gate instead of being skipped', async () => {
  const huge = validFamily({ themes: [{ id: 'big-dark', name: 'B', extends: 'dark', padding: 'x'.repeat(1_100_000) }] });
  const root = makeGallery({ big: { family: huge } });
  const report = await run(root);
  assert.equal(report.failed, true);
  assert.match(problemsOf(report, 'big', 'Layout').join(' '), /big\.json cannot be read: larger than 1 MB/);
});

test('a gallery file that is not a regular file fails the gate', async () => {
  const root = makeGallery({ linked: {} });
  const file = join(root, 'themes', 'linked', 'gallery.json');
  unlinkSync(file);
  symlinkSync(join(root, 'tags.json'), file);
  const report = await run(root);
  assert.equal(report.failed, true);
  assert.ok(problemsOf(report, 'linked', 'Layout').includes('gallery.json cannot be read: not a regular file.'));
  assert.deepEqual(problemsOf(report, 'linked', 'Gallery data'), []);
});

test('first-party families may use the product names, others may not', async () => {
  const family = validFamily({ name: 'Kepler Blue', themes: [{ id: 'one-dark', name: 'GitKraken Dark', extends: 'dark' }] });
  const families = { one: { family } };
  const unlisted = await run(makeGallery(families));
  assert.equal(problemsOf(unlisted, 'one', 'Names').length, 2);
  const listed = await run(makeGallery(families, { firstParty: ['one'] }));
  assert.deepEqual(problemsOf(listed, 'one', 'Names'), []);
});

test('a family newly listed in first-party.json is a review note, not a failure', async () => {
  const root = makeGallery(
    {
      one: { family: validFamily({ name: 'Kepler Blue', themes: [{ id: 'one-dark', name: 'D', extends: 'dark' }] }) },
      two: {},
    },
    { firstParty: ['one', 'two'] },
  );
  const report = await run(root, {
    base: 'origin/main',
    readBase: (path) => (path === 'first-party.json' ? JSON.stringify(['two']) : null),
    baseSlugs: [],
  });
  assert.equal(report.failed, false, renderText(report));
  assert.deepEqual(report.review.map((r) => r.slug), ['one'], 'a family already first-party on the base needs no note');
  assert.match(plain(report.review[0].notes[0]), /first-party\.json newly lists this family/);
});

test('first-party.json must list existing folders, once each', async () => {
  const report = await run(makeGallery({ example: {} }, { firstParty: ['ghost', 'example', 'example'] }));
  const problems = globalProblemsOf(report, 'Gallery lists');
  assert.ok(problems.includes('first-party.json lists "ghost", which has no folder.'), problems.join('\n'));
  assert.ok(problems.includes('first-party.json repeats a slug.'), problems.join('\n'));
  assert.equal(problems.length, 2);
});

test('a list file over 1 MB fails the gate', async () => {
  const root = makeGallery({ example: {} });
  writeFileSync(join(root, 'featured.json'), formatJson(['x'.repeat(1_100_000)]));
  const report = await run(root);
  assert.match(globalProblemsOf(report, 'Gallery lists')[0], /featured\.json cannot be read: larger than 1 MB/);
});

test('the index may not hold more than 500 families', async () => {
  const families = {};
  for (let i = 0; i < 501; i++) {
    families[`f${i}`] = { family: validFamily({ themes: [{ id: `f${i}-dark`, name: 'F', extends: 'dark' }] }) };
  }
  const report = await run(makeGallery(families));
  assert.match(globalProblemsOf(report, 'Index size')[0], /501 families.*more than 500/);
  const ok = await run(makeGallery({ example: {} }));
  assert.deepEqual(globalProblemsOf(ok, 'Index size'), []);
});

test('family and gallery files may not add up to more than 7 MB', async () => {
  const families = {};
  for (let i = 0; i < 8; i++) {
    families[`f${i}`] = {
      family: validFamily({ themes: [{ id: `f${i}-dark`, name: 'F', extends: 'dark', padding: 'x'.repeat(950_000) }] }),
    };
  }
  const report = await run(makeGallery(families));
  assert.match(globalProblemsOf(report, 'Index size')[0], /add up to \d+ bytes; the limit is 7340032/);
});

test('removing a family needs its slug in withdrawn.json', async () => {
  const check = async (withdrawn) => {
    const root = makeGallery({ kept: {} }, { withdrawn });
    const report = await run(root, {
      base: 'origin/main',
      readBase: () => null,
      baseSlugs: ['gone', 'kept'],
    });
    return globalProblemsOf(report, 'Removed families');
  };
  const failure = await check([]);
  assert.equal(failure.length, 1);
  assert.match(failure[0], /Family "gone" is removed\. Removing a family needs its slug in withdrawn\.json, so the name is never reused\./);
  assert.deepEqual(await check(['gone']), []);
  const noBase = await run(makeGallery({ kept: {} }), { baseSlugs: ['gone'] });
  assert.equal(globalProblemsOf(noBase, 'Removed families'), undefined, 'no base, no comparison');
});

test('dropping a theme id from an existing family is a review note, not a failure', async () => {
  const before = validFamily({
    version: '1.0.0',
    themes: [
      { id: 'example-dark', name: 'D', extends: 'dark' },
      { id: 'example-light', name: 'L', extends: 'light' },
      { id: 'example-dim', name: 'M', extends: 'dark' },
    ],
  });
  const root = makeGallery({ example: { family: validFamily({ version: '1.1.0' }) } });
  const report = await run(root, {
    base: 'origin/main',
    readBase: (path) => (path.endsWith('example.json') ? JSON.stringify(before) : null),
    baseSlugs: ['example'],
  });
  assert.equal(report.failed, false, renderText(report));
  assert.deepEqual(report.review.map((r) => r.slug), ['example']);
  assert.equal(
    plain(report.review[0].notes[0]),
    'Removes theme ids example-light, example-dim: anyone using them in Kepler keeps their installed copy but loses updates.',
  );
  assert.match(renderText(report), /Review notes\n {2}NOTE {2}example: Removes theme ids/);
  assert.match(renderMarkdown(report), /\*\*Review notes\*\*[\s\S]*`example-light`, `example-dim`/);
  const fresh = await run(root, { base: 'origin/main', readBase: () => null, baseSlugs: [] });
  assert.deepEqual(fresh.review, [], 'a new family has nothing to lose');
});

test('a change by someone who is not a listed maintainer needs a maintainer to agree', async () => {
  const root = makeGallery({ example: {}, other: { family: validFamily({ themes: [{ id: 'other-dark', name: 'O', extends: 'dark' }] }) } });
  const baseGallery = JSON.stringify({ maintainers: ['Ada', 'grace'], tags: [] });
  const options = {
    base: 'origin/main',
    readBase: (path) => (path === 'themes/example/gallery.json' ? baseGallery : null),
    baseSlugs: ['example'],
    changedFiles: ['themes/example/example.json', 'themes/other/other.json', 'README.md'],
  };
  const stranger = await run(root, { ...options, author: 'mallory' });
  assert.deepEqual(stranger.review.map((r) => r.slug), ['example'], 'only changed families that exist on the base');
  assert.equal(
    plain(stranger.review[0].notes[0]),
    'Maintainers on the base branch: Ada, grace. The author mallory is not one of them, so a listed maintainer must agree in the pull request before it merges.',
  );
  assert.equal(stranger.failed, false, 'a review note never fails the gate');
  const own = await run(root, { ...options, author: 'ADA' });
  assert.equal(plain(own.review[0].notes[0]), 'Maintainers on the base branch: Ada, grace. The author ADA is one of them.');
  const anonymous = await run(root, options);
  assert.deepEqual(anonymous.review, [], 'without an author the section is skipped');
});

test('the markdown report puts untrusted strings in code spans', async () => {
  const name = 'Kepler @octo [click](https://evil.example) `tick`\n# heading';
  const root = makeGallery({ evil: { family: validFamily({ name }) } });
  const markdown = renderMarkdown(await run(root));
  assert.ok(markdown.includes('`Kepler @octo [click](https://evil.example) tick # heading`'), markdown);
  assert.ok(markdown.includes('**`evil`**'));
  assert.ok(!markdown.includes('\u0001') && !markdown.includes('\u0002'));
  assert.ok(!renderText(await run(root)).includes('\u0001'));
  const hostile = makeGallery({ 'a`b': {} });
  const report = renderMarkdown(await run(hostile));
  assert.ok(report.includes('**`ab`**'), report);
});

test('Kepler validation: a missing bundle only warns, except in CI', async () => {
  const root = makeGallery({ example: {} });
  const local = await run(root, { ci: false });
  assert.equal(local.failed, false);
  assert.ok(local.notes.some((n) => /skipped/.test(n)));
  const ci = await run(root, { ci: true });
  assert.equal(ci.failed, true);
});

test('Kepler validation: errors, notices, contrast failures and reserved ids fail', async () => {
  const root = makeGallery({ example: {} });
  const vendor = {
    checkThemeFamily: async () => ({
      ok: false,
      errors: [{ message: 'bad color' }],
      notices: [{ message: 'unknown key' }],
      themes: [{ id: 'example-dark', contrastFailures: [{ label: 'ink on surface', ratio: 3.1, min: 4.5 }] }],
      reservedIds: ['example-dark'],
    }),
  };
  const report = await run(root, { vendor });
  const text = problemsOf(report, 'example', 'Kepler validation').join('\n');
  for (const part of ['bad color', 'unknown key', 'ink on surface', 'reserved']) assert.ok(text.includes(part), part);
  const clean = await run(root, {
    vendor: { checkThemeFamily: async () => ({ ok: true, errors: [], notices: [], themes: [], reservedIds: [] }) },
  });
  assert.equal(clean.failed, false);
});

test('Scope: a change outside themes/ is reported and does not fail', async () => {
  const root = makeGallery({ example: {} });
  const report = await run(root, {
    changedFiles: ['scripts/check.mjs', 'themes/example/example.json'],
  });
  assert.equal(report.failed, false, renderText(report));
  assert.deepEqual(report.scope.outside, ['scripts/check.mjs']);
  assert.equal(report.scope.mixed, true);
  for (const out of [renderText(report), renderMarkdown(report)]) {
    assert.ok(out.includes(SCOPE_WARNING));
    assert.ok(out.includes(SCOPE_MIXED));
    assert.ok(out.includes('scripts/check.mjs'));
  }
});

test('Scope: theme-only and tooling-only changes', async () => {
  const root = makeGallery({ example: {} });
  const themeOnly = await run(root, { changedFiles: ['themes/example/gallery.json'] });
  assert.deepEqual(themeOnly.scope, { outside: [], mixed: false });
  assert.ok(!renderText(themeOnly).includes(SCOPE_WARNING));
  const toolingOnly = await run(root, { changedFiles: ['package.json'] });
  assert.deepEqual(toolingOnly.scope, { outside: ['package.json'], mixed: false });
  assert.ok(renderMarkdown(toolingOnly).includes(SCOPE_WARNING));
  assert.equal((await run(root)).scope, null);
});

test('--root checks a gallery in another directory from another cwd, using this checkout\'s tooling', () => {
  const script = fileURLToPath(new URL('../check.mjs', import.meta.url));
  const git = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { stdio: 'ignore' });
  const gallery = makeGallery({ example: {} });
  git(gallery, 'init', '-q', '-b', 'main');
  git(gallery, '-c', 'user.name=t', '-c', 'user.email=t@t', 'add', '-A');
  git(gallery, '-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-q', '-m', 'base');
  git(gallery, 'checkout', '-q', '-b', 'pr');
  // The "pull request" ships its own tooling; it must not be run.
  mkdirSync(join(gallery, 'scripts'));
  writeFileSync(join(gallery, 'scripts', 'check.mjs'), 'process.exit(0);\n');
  const cwd = mkdtempSync(join(tmpdir(), 'kepler-themes-cwd-'));
  let out = '';
  let code = 0;
  try {
    out = execFileSync(process.execPath, [script, '--root', gallery, '--base', 'main'], {
      cwd,
      encoding: 'utf8',
      env: { ...process.env, CI: '' },
    });
  } catch (err) {
    code = err.status;
    out = String(err.stdout);
  }
  assert.equal(code, 0, out);
  assert.match(out, /pass {2}Layout/);
  assert.ok(out.includes(SCOPE_WARNING));
  assert.ok(out.includes('scripts/check.mjs'));
});

test('in CI a base missing from the checkout fails instead of skipping the version rule', () => {
  const script = fileURLToPath(new URL('../check.mjs', import.meta.url));
  const gallery = makeGallery({ example: {} });
  execFileSync('git', ['-C', gallery, 'init', '-q', '-b', 'main'], { stdio: 'ignore' });
  const cwd = mkdtempSync(join(tmpdir(), 'kepler-themes-cwd-'));
  const run = (base) => {
    try {
      execFileSync(process.execPath, [script, '--root', gallery, '--base', base], {
        cwd,
        stdio: 'pipe',
        env: { ...process.env, CI: '1' },
      });
      return { code: 0, err: '' };
    } catch (err) {
      return { code: err.status, err: String(err.stderr) };
    }
  };
  const missing = run('origin/main');
  assert.equal(missing.code, 1);
  assert.match(missing.err, /origin\/main is not in the checkout/);
  // A branch's first push names the commit before it with zeros; there is nothing to compare.
  assert.equal(run('0'.repeat(40)).code, 0);
});

test('--author and the base listing drive the removal rule and the maintainer note from git', () => {
  const script = fileURLToPath(new URL('../check.mjs', import.meta.url));
  const git = (cwd, ...args) =>
    execFileSync('git', ['-C', cwd, '-c', 'user.name=t', '-c', 'user.email=t@t', ...args], { stdio: 'ignore' });
  const gallery = makeGallery({
    example: {},
    gone: { family: validFamily({ themes: [{ id: 'gone-dark', name: 'G', extends: 'dark' }] }) },
  });
  git(gallery, 'init', '-q', '-b', 'main');
  git(gallery, 'add', '-A');
  git(gallery, 'commit', '-q', '-m', 'base');
  git(gallery, 'checkout', '-q', '-b', 'pr');
  writeFileSync(
    join(gallery, 'themes', 'example', 'example.json'),
    formatJson(validFamily({ version: '1.1.0', description: 'Changed.' })),
  );
  for (const name of ['gone.json', 'gallery.json']) unlinkSync(join(gallery, 'themes', 'gone', name));
  rmdirSync(join(gallery, 'themes', 'gone'));
  const cwd = mkdtempSync(join(tmpdir(), 'kepler-themes-cwd-'));
  const check = (...extra) => {
    try {
      return { code: 0, out: execFileSync(process.execPath, [script, '--root', gallery, '--base', 'main', ...extra], { cwd, encoding: 'utf8', env: { ...process.env, CI: '' } }) };
    } catch (err) {
      return { code: err.status, out: String(err.stdout) };
    }
  };
  const stranger = check('--author', 'mallory');
  assert.equal(stranger.code, 1, stranger.out);
  assert.match(stranger.out, /FAIL {2}Removed families: Family "gone" is removed\. Removing a family needs its slug in withdrawn\.json/);
  assert.match(stranger.out, /NOTE {2}example: Maintainers on the base branch: ada\. The author mallory is not one of them/);
  assert.match(check('--author', 'ADA').out, /The author ADA is one of them\./);
  assert.ok(!check().out.includes('Review notes'), 'no --author, no maintainer section');
});
