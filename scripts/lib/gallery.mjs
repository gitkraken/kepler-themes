import { existsSync, lstatSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/** Kepler's theme id pattern; a family's folder name is its slug and follows the same rule. */
export const THEME_ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const MAX_THEME_ID_LENGTH = 64;
export const MAX_FAMILY_BYTES = 64 * 1024;
export const MAX_TAGS = 5;
export const MAX_MAINTAINERS = 20;

// The Kepler app drops a published index beyond these limits, so the repo refuses to build one.
export const MAX_INDEX_BYTES = 8 * 1024 * 1024;
export const MAX_FAMILIES = 500;
// check.mjs cannot build the index (it needs git history), so it bounds the files that go into it.
// The index stores each family compacted, which leaves 1 MB of room for the per-family metadata.
export const MAX_TREE_BYTES = 7 * 1024 * 1024;

/** The keys Kepler's family envelope accepts. */
export const ENVELOPE_KEYS = [
  '$schema',
  'schemaVersion',
  'name',
  'version',
  'author',
  'description',
  'license',
  'homepage',
  'themes',
];

export const LICENSES = [
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'CC0-1.0',
  'CC-BY-4.0',
  'Unlicense',
  'MPL-2.0',
];

export function formatJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

// Untrusted values (file and folder names, logins, messages quoting file content) are wrapped in
// marker characters so the markdown report can put them in code spans and the text report can drop
// the markers. Markers inside the value are removed so a value cannot close its own span.
const OPEN = '\u0001';
const CLOSE = '\u0002';

export function mark(value) {
  return `${OPEN}${String(value).replace(/[\u0001\u0002]/g, '')}${CLOSE}`;
}

export function plain(text) {
  return text.replace(/[\u0001\u0002]/g, '');
}

function codeSpan(value) {
  const clean = value.replace(/`/g, '').replace(/[\r\n]+/g, ' ').trim();
  return clean.length === 0 ? '`(empty)`' : `\`${clean}\``;
}

// Text outside the markers is the report's own wording; escaping it as well keeps a value that
// escaped its marker from turning into a link, an image or HTML.
function escapeMarkdown(text) {
  return text.replace(/[\\`<>[\]*_]/g, (c) => `\\${c}`);
}

export function markdown(text) {
  let out = '';
  let rest = text;
  for (;;) {
    const open = rest.indexOf(OPEN);
    if (open < 0) break;
    const close = rest.indexOf(CLOSE, open);
    if (close < 0) break;
    out += escapeMarkdown(plain(rest.slice(0, open))) + codeSpan(plain(rest.slice(open + 1, close)));
    rest = rest.slice(close + 1);
  }
  return out + escapeMarkdown(plain(rest));
}

// The trusted check reads a pull request's checkout, which can hold links to
// anything on the runner; only regular files of a sane size are ever read, so
// nothing outside the checkout can reach the report.
const MAX_READ_BYTES = 1024 * 1024;

function readJson(path) {
  const stat = lstatSync(path, { throwIfNoEntry: false });
  if (!stat) return { missing: true };
  if (!stat.isFile()) return { unreadable: 'not a regular file' };
  if (stat.size > MAX_READ_BYTES) return { unreadable: 'larger than 1 MB' };
  const text = readFileSync(path, 'utf8');
  try {
    return { text, value: JSON.parse(text) };
  } catch (err) {
    return { text, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Every `themes/<slug>/` folder with its files read and parsed; problems are left to the checks. */
export function loadGallery(root) {
  const themesDir = join(root, 'themes');
  const strays = [];
  const families = [];
  if (lstatSync(themesDir, { throwIfNoEntry: false })?.isDirectory()) {
    for (const entry of readdirSync(themesDir, { withFileTypes: true }).sort((a, b) =>
      a.name < b.name ? -1 : a.name > b.name ? 1 : 0,
    )) {
      if (!entry.isDirectory()) {
        strays.push(entry.name);
        continue;
      }
      const slug = entry.name;
      const dir = join(themesDir, slug);
      const contents = readdirSync(dir, { withFileTypes: true });
      families.push({
        slug,
        dir,
        familyPath: join(dir, `${slug}.json`),
        galleryPath: join(dir, 'gallery.json'),
        files: contents.filter((e) => e.isFile()).map((e) => e.name),
        folders: contents.filter((e) => !e.isFile()).map((e) => e.name),
        family: readJson(join(dir, `${slug}.json`)),
        gallery: readJson(join(dir, 'gallery.json')),
      });
    }
  }
  return { strays, families };
}

export function layoutProblems(f) {
  const problems = [];
  if (!THEME_ID_PATTERN.test(f.slug) || f.slug.length > MAX_THEME_ID_LENGTH) {
    problems.push(
      `Folder name "${mark(f.slug)}" must be lowercase letters and digits joined by single hyphens, at most ${MAX_THEME_ID_LENGTH} characters.`,
    );
  }
  for (const [name, file] of [
    [`${f.slug}.json`, f.family],
    ['gallery.json', f.gallery],
  ]) {
    if (file.unreadable) problems.push(`${mark(name)} cannot be read: ${file.unreadable}.`);
    else if (!f.files.includes(name)) problems.push(`Missing ${mark(name)}.`);
  }
  for (const name of f.files) {
    if (name !== `${f.slug}.json` && name !== 'gallery.json') {
      problems.push(`Unexpected file ${mark(name)}: a family folder holds only ${mark(`${f.slug}.json`)} and gallery.json (no images).`);
    }
  }
  for (const name of f.folders) problems.push(`Unexpected folder ${mark(name)}.`);
  return problems;
}

function fileFormatProblem(label, file) {
  if (file.missing || file.unreadable) return null;
  if (file.error) {
    return `${mark(label)} is not plain JSON (comments and trailing commas are not allowed): ${mark(file.error)}`;
  }
  if (file.text !== formatJson(file.value)) {
    return `${mark(label)} is not formatted canonically (2-space JSON, trailing newline). Run "node scripts/check.mjs --fix".`;
  }
  return null;
}

export function formatProblems(f) {
  return [
    fileFormatProblem(`${f.slug}.json`, f.family),
    fileFormatProblem(`${f.slug}/gallery.json`, f.gallery),
  ].filter((p) => p !== null);
}

/** Rewrites every parseable gallery file in canonical form; returns the paths it changed. */
export function fixFormatting(root) {
  const changed = [];
  for (const f of loadGallery(root).families) {
    for (const [path, file] of [
      [f.familyPath, f.family],
      [f.galleryPath, f.gallery],
    ]) {
      if (file.value !== undefined && file.text !== formatJson(file.value)) {
        writeFileSync(path, formatJson(file.value));
        changed.push(path);
      }
    }
  }
  return changed;
}

/** `featured.json`, `withdrawn.json`, `first-party.json` and `tags.json`, each an array of strings. */
export function loadLists(root) {
  const problems = [];
  const lists = {};
  for (const [name, key] of [
    ['featured', 'featured'],
    ['withdrawn', 'withdrawn'],
    ['first-party', 'firstParty'],
    ['tags', 'tags'],
  ]) {
    const file = readJson(join(root, `${name}.json`));
    lists[key] = [];
    if (file.missing) {
      problems.push(`${name}.json is missing.`);
    } else if (file.unreadable) {
      problems.push(`${name}.json cannot be read: ${file.unreadable}.`);
    } else if (file.error) {
      problems.push(`${name}.json is not valid JSON: ${mark(file.error)}`);
    } else if (!Array.isArray(file.value) || !file.value.every((v) => typeof v === 'string')) {
      problems.push(`${name}.json must be an array of strings.`);
    } else {
      lists[key] = file.value;
    }
  }
  return { ...lists, problems };
}

/** Kepler's validator bundle, or null while it has not been vendored yet. */
export async function loadVendor(root) {
  const path = join(root, 'vendor', 'kepler-theme-check.mjs');
  if (!existsSync(path)) return null;
  return import(pathToFileURL(path).href);
}

/**
 * Problems with how big the index is or would be. `bytes` is the serialized index, or with
 * `proxy` the sum of the family and gallery files that go into it.
 */
export function indexLimitProblems({ familyCount, bytes }, { proxy = false } = {}) {
  const problems = [];
  if (familyCount > MAX_FAMILIES) {
    problems.push(
      `The gallery holds ${familyCount} families; the Kepler app drops an index with more than ${MAX_FAMILIES}.`,
    );
  }
  if (proxy && bytes > MAX_TREE_BYTES) {
    problems.push(
      `The family and gallery files add up to ${bytes} bytes; the limit is ${MAX_TREE_BYTES} (7 MB), so the built index stays under the ${MAX_INDEX_BYTES} bytes (8 MB) the Kepler app accepts.`,
    );
  } else if (!proxy && bytes > MAX_INDEX_BYTES) {
    problems.push(
      `The index is ${bytes} bytes; the Kepler app drops an index over ${MAX_INDEX_BYTES} (8 MB).`,
    );
  }
  return problems;
}
