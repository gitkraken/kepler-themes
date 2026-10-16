import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalHash } from './lib/canonical-hash.mjs';
import { renderLandingPage } from './lib/landing-page.mjs';
import {
  formatProblems,
  indexLimitProblems,
  layoutProblems,
  loadGallery,
  loadLists,
  loadVendor,
  mark,
  plain,
} from './lib/gallery.mjs';

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function git(root, args) {
  try {
    return execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return '';
  }
}

/**
 * Commits that touched `path`, newest first, with their committer dates (strict ISO 8601). The
 * committer date is set when the change lands; the author date is whatever the contributor chose.
 */
function history(root, path) {
  return git(root, ['log', '--format=%H %cI', '--', path])
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [hash, date] = line.split(' ');
      return { hash, date };
    });
}

/** Version to canonical hash for every earlier commit of the file; the newest commit of a version wins. */
function earlierVersions(root, path, currentVersion, commits) {
  const versions = {};
  for (const { hash } of commits) {
    const text = git(root, ['show', `${hash}:${path}`]);
    if (!text) continue;
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      continue;
    }
    const version = parsed?.version;
    if (typeof version !== 'string' || version === currentVersion || version in versions) continue;
    versions[version] = canonicalHash(parsed);
  }
  return versions;
}

/** The calendar day (UTC) of a strict ISO 8601 timestamp. */
function dayOf(timestamp) {
  const time = Date.parse(timestamp);
  return Number.isNaN(time) ? null : new Date(time).toISOString().slice(0, 10);
}

/** What the gallery's files must look like for the index to be built from them. */
function shapeProblems(f) {
  const problems = [];
  if (f.family.value !== undefined && !isRecord(f.family.value)) {
    problems.push(`${mark(`${f.slug}.json`)} must be a JSON object.`);
  }
  const gallery = f.gallery.value;
  if (gallery !== undefined && (!isRecord(gallery) || !Array.isArray(gallery.maintainers) || !Array.isArray(gallery.tags))) {
    problems.push(`${mark(`${f.slug}/gallery.json`)} must be a JSON object with maintainers and tags arrays.`);
  }
  return problems;
}

function throwOnLimits(problems) {
  if (problems.length > 0) throw new Error(`Cannot publish the index:\n${problems.map((p) => `  ${p}`).join('\n')}`);
}

/** The text that gets written; throws when the Kepler app would drop it for being too big. */
export function serializeIndex(index) {
  const text = `${JSON.stringify(index)}\n`;
  throwOnLimits(indexLimitProblems({ familyCount: index.families.length, bytes: Buffer.byteLength(text, 'utf8') }));
  return text;
}

export async function buildIndex({ root, now = new Date() }) {
  const { strays, families } = loadGallery(root);
  const lists = loadLists(root);
  const problems = [
    ...strays.map((s) => `themes/${mark(s)} is not a family folder.`),
    ...lists.problems,
    ...families.flatMap((f) =>
      [...layoutProblems(f), ...formatProblems(f), ...shapeProblems(f)].map((p) => `${mark(f.slug)}: ${p}`),
    ),
  ];
  if (problems.length > 0) {
    throw new Error(`Cannot build the index:\n${problems.map((p) => `  ${plain(p)}`).join('\n')}`);
  }
  throwOnLimits(indexLimitProblems({ familyCount: families.length, bytes: 0 }));
  const vendor = await loadVendor(root);
  const today = now.toISOString().slice(0, 10);

  const entries = families.map((f) => {
    const family = f.family.value;
    const path = `themes/${f.slug}/${f.slug}.json`;
    const commits = history(root, path);
    const entry = {
      slug: f.slug,
      name: family.name,
      author: family.author,
      maintainers: f.gallery.value.maintainers,
      tags: f.gallery.value.tags,
      schemaVersion: family.schemaVersion ?? 1,
      version: family.version,
      addedAt: dayOf(commits.at(-1)?.date) ?? today,
      updatedAt: dayOf(commits[0]?.date) ?? today,
      sha256: canonicalHash(family),
      versions: earlierVersions(root, path, family.version, commits),
    };
    const position = lists.featured.indexOf(f.slug);
    if (position >= 0) entry.featured = position + 1;
    entry.family = family;
    return entry;
  });

  return {
    indexVersion: 1,
    generatedAt: now.toISOString(),
    checkedWith: typeof vendor?.version === 'string' ? vendor.version : 'none',
    families: entries,
    withdrawn: lists.withdrawn,
  };
}

if (import.meta.main) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  try {
    const index = await buildIndex({ root });
    const text = serializeIndex(index);
    const out = join(root, 'dist', 'v1', 'index.json');
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, text);
    writeFileSync(join(root, 'dist', 'index.html'), renderLandingPage(index));
    console.log(`Wrote ${out} (${index.families.length} families, checked with ${index.checkedWith}).`);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
