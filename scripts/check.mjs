import { execFileSync } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalHash } from './lib/canonical-hash.mjs';
import {
  ENVELOPE_KEYS,
  LICENSES,
  MAX_FAMILY_BYTES,
  MAX_MAINTAINERS,
  MAX_TAGS,
  MAX_THEME_ID_LENGTH,
  THEME_ID_PATTERN,
  fixFormatting,
  formatProblems,
  indexLimitProblems,
  layoutProblems,
  loadGallery,
  loadLists,
  loadVendor,
  mark,
  markdown,
  plain,
} from './lib/gallery.mjs';
import { comparePrecedence, isSemver } from './lib/semver.mjs';

const LOGIN = /^[a-z0-9]+(-[a-z0-9]+)*$/i;
const RESERVED_NAME = /kepler|gitkraken/i;

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parsedFamily(f) {
  return isRecord(f.family.value) ? f.family.value : null;
}

function sizeProblems(f) {
  if (f.family.text === undefined) return [];
  const bytes = Buffer.byteLength(f.family.text, 'utf8');
  return bytes > MAX_FAMILY_BYTES
    ? [`${mark(`${f.slug}.json`)} is ${bytes} bytes; the limit is ${MAX_FAMILY_BYTES} (64 KB).`]
    : [];
}

function envelopeProblems(f) {
  if (f.family.missing || f.family.unreadable || f.family.error) return [];
  const family = parsedFamily(f);
  if (!family) return [`${mark(`${f.slug}.json`)} must be a JSON object.`];
  const problems = [];
  if (family.schemaVersion !== undefined && family.schemaVersion !== 1) {
    problems.push('schemaVersion must be absent or 1.');
  }
  if (typeof family.name !== 'string' || family.name.length === 0 || family.name.length > 64) {
    problems.push('name is required: 1 to 64 characters.');
  }
  if (!isSemver(family.version)) {
    problems.push('version is required and must be a semantic version (semver.org 2.0.0), such as 1.0.0.');
  }
  if (typeof family.license !== 'string' || !LICENSES.includes(family.license)) {
    problems.push(`license is required and must be one of: ${LICENSES.join(', ')}.`);
  }
  if (
    typeof family.description !== 'string' ||
    family.description.length === 0 ||
    family.description.length > 200
  ) {
    problems.push('description is required: 1 to 200 characters.');
  }
  if (typeof family.author !== 'string' || family.author.length === 0 || family.author.length > 128) {
    problems.push('author is required: 1 to 128 characters.');
  }
  for (const key of Object.keys(family)) {
    if (!ENVELOPE_KEYS.includes(key)) {
      problems.push(`"${mark(key)}" is not a key of Kepler's theme family format.`);
    }
  }
  if (family.homepage !== undefined) {
    let ok = false;
    try {
      ok = typeof family.homepage === 'string' && new URL(family.homepage).protocol === 'https:';
    } catch {
      ok = false;
    }
    if (!ok) problems.push('homepage must be an https URL.');
  }
  if (!Array.isArray(family.themes) || family.themes.length === 0) {
    problems.push('themes must be a non-empty array.');
  }
  return problems;
}

function themesOf(f) {
  const family = parsedFamily(f);
  return family && Array.isArray(family.themes) ? family.themes.filter(isRecord) : [];
}

function nameProblems(f) {
  const family = parsedFamily(f);
  if (!family) return [];
  const names = [
    ['Family name', family.name],
    ...themesOf(f).map((t) => [`Theme name for "${mark(String(t.id))}"`, t.name]),
  ];
  return names
    .filter(([, name]) => typeof name === 'string' && RESERVED_NAME.test(name))
    .map(([label, name]) => `${label} "${mark(name)}" contains "Kepler" or "GitKraken", which are reserved for the products.`);
}

function idProblems(f, idOwners, withdrawn) {
  const problems = [];
  if (withdrawn.includes(f.slug)) {
    problems.push(`The slug "${mark(f.slug)}" belongs to a withdrawn theme and stays reserved.`);
  }
  const seen = new Set();
  for (const theme of themesOf(f)) {
    const id = theme.id;
    if (typeof id !== 'string' || !THEME_ID_PATTERN.test(id) || id.length > MAX_THEME_ID_LENGTH) {
      problems.push(`Theme id ${mark(JSON.stringify(id))} must be lowercase letters and digits joined by single hyphens.`);
      continue;
    }
    if (seen.has(id)) problems.push(`Theme id "${mark(id)}" is repeated in this family.`);
    seen.add(id);
    const owners = (idOwners.get(id) ?? []).filter((slug) => slug !== f.slug);
    if (owners.length > 0) {
      problems.push(`Theme id "${mark(id)}" is already used by ${owners.map((s) => `"${mark(s)}"`).join(', ')}. Ids must be unique across the gallery.`);
    }
  }
  return problems;
}

function galleryDataProblems(f, vocabulary) {
  if (f.gallery.missing || f.gallery.unreadable || f.gallery.error) return [];
  const data = f.gallery.value;
  if (!isRecord(data)) return ['gallery.json must be a JSON object.'];
  const problems = [];
  const { maintainers, tags } = data;
  if (!Array.isArray(maintainers) || maintainers.length === 0 || maintainers.length > MAX_MAINTAINERS) {
    problems.push(`maintainers must be an array of 1 to ${MAX_MAINTAINERS} GitHub logins.`);
  } else {
    for (const m of maintainers) {
      if (typeof m !== 'string' || !LOGIN.test(m) || m.length > 39) {
        problems.push(`maintainer ${mark(JSON.stringify(m))} is not a GitHub login.`);
      }
    }
    const logins = maintainers.filter((m) => typeof m === 'string').map((m) => m.toLowerCase());
    if (new Set(logins).size !== logins.length) problems.push('maintainers repeats a login (logins are not case sensitive).');
  }
  if (!Array.isArray(tags)) {
    problems.push('tags must be an array (it may be empty).');
  } else {
    if (tags.length > MAX_TAGS) problems.push(`tags has ${tags.length} entries; the limit is ${MAX_TAGS}.`);
    for (const tag of tags) {
      if (typeof tag !== 'string' || !vocabulary.includes(tag)) {
        problems.push(`tag ${mark(JSON.stringify(tag))} is not in tags.json.`);
      }
    }
    if (new Set(tags).size !== tags.length) problems.push('tags repeats an entry.');
  }
  for (const key of Object.keys(data)) {
    if (key !== 'maintainers' && key !== 'tags') problems.push(`"${mark(key)}" is not a gallery.json key.`);
  }
  return problems;
}

function versionProblems(f, baseText) {
  const family = parsedFamily(f);
  if (!family || !isSemver(family.version)) return [];
  if (baseText === null) return [];
  let base;
  try {
    base = JSON.parse(baseText);
  } catch {
    return [];
  }
  if (!isRecord(base)) return [];
  if (canonicalHash(base) === canonicalHash(family)) return [];
  if (!isSemver(base.version)) return [];
  if (comparePrecedence(family.version, base.version) <= 0) {
    return [`Raise version above ${base.version} to publish this change (it is ${family.version} now).`];
  }
  return [];
}

async function keplerProblems(vendor, f) {
  if (f.family.text === undefined) return [];
  let result;
  try {
    result = await vendor.checkThemeFamily(f.family.text);
  } catch (err) {
    return [`Kepler's validator failed to run: ${mark(err instanceof Error ? err.message : String(err))}`];
  }
  const problems = [];
  for (const e of result.errors ?? []) problems.push(`Error: ${mark(e.message)}`);
  for (const n of result.notices ?? []) problems.push(`Notice: ${mark(n.message)}`);
  for (const theme of result.themes ?? []) {
    for (const c of theme.contrastFailures ?? []) {
      problems.push(`Contrast in "${mark(theme.id)}": ${mark(c.label)} is ${c.ratio}, needs at least ${c.min}.`);
    }
  }
  const reserved = new Set(result.reservedIds ?? []);
  for (const theme of themesOf(f)) {
    if (typeof theme.id === 'string' && reserved.has(theme.id)) {
      problems.push(`Theme id "${mark(theme.id)}" is reserved (built-in or bundled with Kepler).`);
    }
  }
  if (result.ok === false && problems.length === 0) problems.push("Kepler's validator rejected the file.");
  return problems;
}

export const SCOPE_WARNING =
  "Changes the gallery's tooling or settings: review it as code. The gate above ran the tooling on main, not this pull request's.";
export const SCOPE_MIXED =
  'Changes files outside its own folder under themes/ together with a theme: split the theme into its own pull request so each can be reviewed on its own.';

/** Informational only: the gate never fails on scope; the reviewer decides. */
function scopeOf(changedFiles) {
  if (changedFiles === null) return null;
  const outside = changedFiles.filter((p) => !p.startsWith('themes/')).sort();
  const slugs = new Set(
    changedFiles.filter((p) => p.startsWith('themes/')).map((p) => p.split('/')[1] ?? ''),
  );
  const outsideThemes = changedFiles.filter(
    (p) => p.startsWith('themes/') && p.split('/').length < 3,
  );
  const stray = [...outside, ...outsideThemes.filter((p) => !outside.includes(p))];
  return {
    outside: stray,
    mixed: slugs.size > 0 && (stray.length > 0 || slugs.size > 1),
  };
}

function parseBaseJson(text) {
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function themeIdsOf(family) {
  return isRecord(family) && Array.isArray(family.themes)
    ? family.themes.filter(isRecord).map((t) => t.id).filter((id) => typeof id === 'string')
    : [];
}

function removedFamilyProblems(families, baseSlugs, withdrawn) {
  const present = new Set(families.map((f) => f.slug));
  return baseSlugs
    .filter((slug) => !present.has(slug) && !withdrawn.includes(slug))
    .map(
      (slug) =>
        `Family "${mark(slug)}" is removed. Removing a family needs its slug in withdrawn.json, so the name is never reused.`,
    );
}

/**
 * Things a reviewer should weigh that are not failures: who may speak for each changed family,
 * and theme ids a change takes away. Returns [{ slug, notes }] sorted by slug.
 */
function reviewNotes({ families, baseSlugs, readBase, author, changedFiles }) {
  const bySlug = new Map();
  const add = (slug, note) => bySlug.set(slug, [...(bySlug.get(slug) ?? []), note]);
  const onBase = new Set(baseSlugs);

  if (author !== null && changedFiles !== null) {
    const changed = new Set(
      changedFiles.filter((p) => p.startsWith('themes/') && p.split('/').length >= 3).map((p) => p.split('/')[1]),
    );
    for (const slug of [...changed].filter((s) => onBase.has(s))) {
      const gallery = parseBaseJson(readBase(`themes/${slug}/gallery.json`));
      const maintainers =
        isRecord(gallery) && Array.isArray(gallery.maintainers)
          ? gallery.maintainers.filter((m) => typeof m === 'string')
          : [];
      const listed = maintainers.length > 0 ? maintainers.map(mark).join(', ') : 'none';
      if (maintainers.some((m) => m.toLowerCase() === author.toLowerCase())) {
        add(slug, `Maintainers on the base branch: ${listed}. The author ${mark(author)} is one of them.`);
      } else {
        add(
          slug,
          `Maintainers on the base branch: ${listed}. The author ${mark(author)} is not one of them, so a listed maintainer must agree in the pull request before it merges.`,
        );
      }
    }
  }

  for (const f of families) {
    if (!onBase.has(f.slug)) continue;
    const family = parsedFamily(f);
    if (!family) continue;
    const before = themeIdsOf(parseBaseJson(readBase(`themes/${f.slug}/${f.slug}.json`)));
    const now = new Set(themeIdsOf(family));
    const removed = before.filter((id) => !now.has(id));
    if (removed.length > 0) {
      add(
        f.slug,
        `Removes theme ids ${removed.map(mark).join(', ')}: anyone using them in Kepler keeps their installed copy but loses updates.`,
      );
    }
  }

  return [...bySlug.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([slug, notes]) => ({ slug, notes }));
}

function treeLimitProblems(families) {
  const bytes = families.reduce(
    (sum, f) =>
      sum +
      (f.family.text === undefined ? 0 : Buffer.byteLength(f.family.text, 'utf8')) +
      (f.gallery.text === undefined ? 0 : Buffer.byteLength(f.gallery.text, 'utf8')),
    0,
  );
  return indexLimitProblems({ familyCount: families.length, bytes }, { proxy: true });
}

/**
 * Runs every check. `readBase(path)` returns the text of a repo-relative path at the base ref,
 * or null when it does not exist there; `base` is null when there is no base to compare with, and
 * `baseSlugs` lists the family folders the base has (null when unknown).
 * `changedFiles` lists the repo-relative paths the change touches (null when unknown), and
 * `author` is the login of whoever opened the change (null skips the maintainer note).
 * Returns { families: [{ slug, checks: [{ name, problems }] }], global, review, scope, notes, failed }.
 */
export async function runChecks({
  root,
  base = null,
  readBase = () => null,
  baseSlugs = null,
  author = null,
  vendor = null,
  ci = false,
  changedFiles = null,
}) {
  const { strays, families } = loadGallery(root);
  const lists = loadLists(root);
  const notes = [];
  if (base === null) {
    notes.push('No base ref is available, so every family is treated as new and the version rule is not enforced.');
  }

  const idOwners = new Map();
  for (const f of families) {
    for (const theme of themesOf(f)) {
      if (typeof theme.id !== 'string') continue;
      idOwners.set(theme.id, [...(idOwners.get(theme.id) ?? []), f.slug]);
    }
  }

  const familyReports = [];
  for (const f of families) {
    const checks = [
      { name: 'Layout', problems: layoutProblems(f) },
      { name: 'Format', problems: formatProblems(f) },
      { name: 'Size', problems: sizeProblems(f) },
      { name: 'Envelope', problems: envelopeProblems(f) },
      {
        name: 'Version',
        problems: versionProblems(f, base === null ? null : readBase(`themes/${f.slug}/${f.slug}.json`)),
      },
      { name: 'Names', problems: nameProblems(f) },
      { name: 'Ids', problems: idProblems(f, idOwners, lists.withdrawn) },
      { name: 'Gallery data', problems: galleryDataProblems(f, lists.tags) },
    ];
    if (vendor) checks.push({ name: 'Kepler validation', problems: await keplerProblems(vendor, f) });
    familyReports.push({ slug: f.slug, checks });
  }

  const global = [];
  global.push({
    name: 'Gallery folders',
    problems: strays.map((s) => `themes/${mark(s)} is not a family folder; themes/ holds only folders.`),
  });
  const listProblems = [...lists.problems];
  const slugs = new Set(families.map((f) => f.slug));
  for (const slug of lists.featured) {
    if (!slugs.has(slug)) listProblems.push(`featured.json lists "${mark(slug)}", which has no folder.`);
  }
  if (new Set(lists.featured).size !== lists.featured.length) listProblems.push('featured.json repeats a slug.');
  global.push({ name: 'Gallery lists', problems: listProblems });
  global.push({ name: 'Index size', problems: treeLimitProblems(families) });
  if (base !== null && baseSlugs !== null) {
    global.push({ name: 'Removed families', problems: removedFamilyProblems(families, baseSlugs, lists.withdrawn) });
  }
  if (!vendor) {
    const skipped =
      "vendor/kepler-theme-check.mjs is missing, so Kepler's schema and contrast checks were skipped.";
    if (ci) global.push({ name: 'Kepler validation', problems: [`${skipped} CI does not allow skipping them.`] });
    else notes.push(`Warning: ${skipped}`);
  }

  const review =
    base !== null && baseSlugs !== null
      ? reviewNotes({ families, baseSlugs, readBase, author, changedFiles })
      : [];
  const scope = scopeOf(changedFiles);

  const failed =
    familyReports.some((r) => r.checks.some((c) => c.problems.length > 0)) ||
    global.some((c) => c.problems.length > 0);
  return { families: familyReports, global, review, scope, notes, failed };
}

function scopeText(scope) {
  if (!scope) return [];
  const lines = ['', 'Scope'];
  if (scope.outside.length === 0 && !scope.mixed) lines.push('  pass  Only theme folders changed');
  if (scope.outside.length > 0) {
    lines.push(`  NOTE  ${SCOPE_WARNING}`);
    for (const p of scope.outside) lines.push(`        ${p}`);
  }
  if (scope.mixed) lines.push(`  NOTE  ${SCOPE_MIXED}`);
  return lines;
}

function scopeMarkdown(scope) {
  if (!scope) return [];
  const lines = ['', '**Scope**', ''];
  if (scope.outside.length === 0 && !scope.mixed) lines.push('- Only theme folders changed: pass');
  if (scope.outside.length > 0) {
    lines.push(`- **Note:** ${markdown(SCOPE_WARNING)}`);
    for (const p of scope.outside) lines.push(`  - ${markdown(mark(p))}`);
  }
  if (scope.mixed) lines.push(`- **Note:** ${markdown(SCOPE_MIXED)}`);
  return lines;
}

export function renderText(report) {
  const lines = [];
  for (const note of report.notes) lines.push(note);
  for (const r of report.families) {
    lines.push('', r.slug);
    for (const c of r.checks) {
      if (c.problems.length === 0) lines.push(`  pass  ${c.name}`);
      else for (const p of c.problems) lines.push(`  FAIL  ${c.name}: ${p}`);
    }
  }
  lines.push('', 'Gallery');
  for (const c of report.global) {
    if (c.problems.length === 0) lines.push(`  pass  ${c.name}`);
    else for (const p of c.problems) lines.push(`  FAIL  ${c.name}: ${p}`);
  }
  if (report.review.length > 0) {
    lines.push('', 'Review notes');
    for (const r of report.review) for (const n of r.notes) lines.push(`  NOTE  ${r.slug}: ${n}`);
  }
  lines.push(...scopeText(report.scope));
  lines.push('', report.failed ? 'Checks failed.' : 'All checks passed.');
  return `${plain(lines.join('\n'))}\n`;
}

export function renderMarkdown(report) {
  const line = (c) =>
    c.problems.length === 0
      ? `- ${c.name}: pass`
      : c.problems.map((p) => `- ${c.name}: **fail**, ${markdown(p)}`).join('\n');
  const lines = [report.failed ? '### Theme checks: failed' : '### Theme checks: passed', ''];
  for (const note of report.notes) lines.push(`> ${markdown(note)}`, '');
  for (const r of report.families) {
    lines.push(`**${markdown(mark(r.slug))}**`, '');
    for (const c of r.checks) lines.push(line(c));
    lines.push('');
  }
  lines.push('**Gallery**', '');
  for (const c of report.global) lines.push(line(c));
  if (report.review.length > 0) {
    lines.push('', '**Review notes**', '');
    for (const r of report.review) {
      for (const n of r.notes) lines.push(`- ${markdown(mark(r.slug))}: ${markdown(n)}`);
    }
  }
  lines.push(...scopeMarkdown(report.scope));
  return `${lines.join('\n')}\n`;
}

function gitReadBase(root, base) {
  return (path) => {
    try {
      return execFileSync('git', ['-C', root, 'show', `${base}:${path}`], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    } catch {
      return null;
    }
  };
}

/** The family folders the base has; none when it has no themes folder. */
function gitBaseSlugs(root, base) {
  try {
    return execFileSync('git', ['-C', root, 'ls-tree', '-z', '-d', '--name-only', `${base}:themes`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .split('\0')
      .filter(Boolean);
  } catch {
    return [];
  }
}

function refExists(root, ref) {
  try {
    execFileSync('git', ['-C', root, 'rev-parse', '--verify', '--quiet', `${ref}^{commit}`], {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

/** Paths changed since the merge base with `base`, plus uncommitted and untracked files. Git read commands only. */
export function gitChangedFiles(root, base) {
  const run = (args) =>
    execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .split('\0')
      .filter(Boolean);
  try {
    return [
      ...new Set([
        ...run(['diff', '--name-only', '-z', '--no-renames', `${base}...HEAD`]),
        ...run(['diff', '--name-only', '-z', '--no-renames', 'HEAD']),
        ...run(['ls-files', '-z', '--others', '--exclude-standard']),
      ]),
    ];
  } catch {
    return null;
  }
}

function parseArgs(argv) {
  const args = { author: null, base: 'origin/main', fix: false, root: process.cwd() };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--fix') args.fix = true;
    else if (argv[i] === '--base') args.base = argv[++i];
    else if (argv[i] === '--root') args.root = resolve(argv[++i]);
    else if (argv[i] === '--author') args.author = argv[++i] || null;
    else throw new Error(`Unknown argument ${argv[i]}`);
  }
  return args;
}

if (import.meta.main) {
  // The tooling and the Kepler validator always come from this checkout (the trusted one in CI).
  // The gallery under --root is read as data: nothing in it is imported or executed.
  const toolingRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const args = parseArgs(process.argv.slice(2));
  const root = args.root;
  if (args.fix) {
    for (const path of fixFormatting(root)) console.log(`Reformatted ${path}`);
  }
  const base = args.base && refExists(root, args.base) ? args.base : null;
  const report = await runChecks({
    root,
    base,
    readBase: base ? gitReadBase(root, base) : undefined,
    baseSlugs: base ? gitBaseSlugs(root, base) : null,
    author: args.author,
    vendor: await loadVendor(toolingRoot),
    changedFiles: base ? gitChangedFiles(root, base) : null,
    ci: Boolean(process.env.CI),
  });
  const text = renderText(report);
  const reportMarkdown = renderMarkdown(report);
  process.stdout.write(text);
  writeFileSync(join(process.cwd(), 'check-report.md'), reportMarkdown);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, reportMarkdown);
  process.exit(report.failed ? 1 : 0);
}
