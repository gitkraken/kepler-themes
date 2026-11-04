import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { collectPreviews, copySiteFiles } from './build-index.mjs';
import { changedSlugsOf, gitChangedFiles } from './check.mjs';
import { isRecord, loadGallery, loadVendor } from './lib/gallery.mjs';
import { withChrome } from './lib/chrome.mjs';
import { renderLandingPage, themesOf } from './lib/landing-page.mjs';

// Screenshots of the gallery page's own card for each changed theme, one variant at a time, for the
// pull request comment.
//
// The page is built here from `--root`'s JSON, read as data through loadGallery, and from this
// checkout's own validator and static files. Nothing under `--root` is imported or executed, so
// this is safe to run on a pull request's checkout in CI.

export const MAX_SHOTS = 24;

/** The loaded families that can be drawn: their family file parsed to an object. */
export function drawable(families) {
  return families.filter((f) => isRecord(f.family.value));
}

/**
 * The index entries the landing page reads, built straight from the files. A pull request that
 * fails other checks (or has a broken gallery.json) should still get a picture, so nothing is
 * validated here.
 */
export function buildEntries(families) {
  return families.map((f) => {
    const family = f.family.value;
    const gallery = f.gallery.value;
    return {
      slug: f.slug,
      // Any JSON can be here, and an object with a `toString` key throws when the page escapes it.
      name: typeof family.name === 'string' ? family.name : f.slug,
      author: typeof family.author === 'string' ? family.author : '',
      tags: isRecord(gallery) && Array.isArray(gallery.tags) ? gallery.tags : [],
      version: family.version,
      family,
    };
  });
}

/** A family's list in pairs: a[0], b[0], a[1], b[1], and so on, then whatever the longer one has left. */
function interleave(a, b) {
  const out = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}

/**
 * Which screenshots to take: one per theme that has a preview. `index` is the theme's place in its
 * family, as the page numbers its variant dots.
 * Each family's shots go dark, light, dark, light, so the comment can lay them out in rows. Stops at `limit`.
 */
export function planShots(families, previews, limit = MAX_SHOTS) {
  const shots = [];
  let truncated = false;
  for (const f of families) {
    const planned = [];
    for (const [index, theme] of themesOf({ slug: f.slug, family: f.family.value }, previews).entries()) {
      if (!theme.preview) continue;
      planned.push({
        slug: f.slug,
        family: typeof f.family.value.name === 'string' ? f.family.value.name : f.slug,
        index,
        theme: theme.name,
        themeId: theme.id,
        polarity: theme.preview.polarity,
      });
    }
    const ordered = interleave(planned.filter((s) => s.polarity === 'dark'), planned.filter((s) => s.polarity === 'light'));
    for (const shot of ordered) {
      if (shots.length >= limit) {
        truncated = true;
        break;
      }
      shots.push(shot);
    }
  }
  return { shots, truncated };
}

/**
 * The manifest the comment workflow reads. File names are numbers, never contributor text.
 * `truncated` says some variants were left out to stay under the screenshot limit.
 */
export function buildManifest(shots, { truncated = false } = {}) {
  return {
    previews: shots.map((s, i) => ({
      file: `${i + 1}.png`,
      slug: s.slug,
      family: s.family,
      theme: s.theme,
      themeId: s.themeId,
      polarity: s.polarity,
    })),
    ...(truncated ? { truncated: true } : {}),
  };
}

/** The manifest of a run with nothing to draw, written to a folder resetOutDir has emptied. */
function writeEmptyManifest(outDir) {
  const manifest = buildManifest([]);
  writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest)}\n`);
  return manifest;
}

const OUTPUT_FILE = /^(manifest\.json|[0-9]+\.png)$/;

/**
 * Empties `outDir` for a new run. Only a folder that holds nothing but files a previous run wrote
 * is cleared, so a mistyped `--out` cannot delete anything else.
 */
export function resetOutDir(outDir) {
  if (existsSync(outDir)) {
    const stray = readdirSync(outDir, { withFileTypes: true }).find((e) => !e.isFile() || !OUTPUT_FILE.test(e.name));
    if (stray) throw new Error(`Refusing to empty ${outDir}: it holds ${stray.name}, which a preview did not write.`);
    rmSync(outDir, { recursive: true, force: true });
  }
  mkdirSync(outDir, { recursive: true });
}

// Page settings for a still picture.
const SCREENSHOT_PAGE = `// The window sweeps between variants, and a screenshot two frames after the switch catches it mid-sweep.
// A picture on its own needs no rounded corners or shadow, which would show the page behind them.
document.head.appendChild(Object.assign(document.createElement('style'), {
  textContent: '* { transition: none !important; } .gcard .frame { border-radius: 0 !important; box-shadow: none !important; }',
}));`;

// The slug is a folder name the pull request chose, so it reaches the page only as a JSON string
// value, never spliced into a selector or into the script's own text. The index is a number this
// script computed. Clicking the variant's dot shows that variant across the whole frame.
//
// A card can sit at a fractional position (its title's line box is not a whole pixel), and a clip
// there would take in a row of the page around the frame. So the clip is pulled in to the device
// pixels the frame covers completely.
function cardScript(slug, index) {
  return `(() => {
  const slug = ${JSON.stringify(slug)};
  const index = ${JSON.stringify(String(index))};
  const card = [...document.querySelectorAll('.entry[data-family]')].find((entry) => entry.dataset.family === slug);
  const frame = card?.querySelector('.sweep');
  if (!frame) return null;
  if (!frame.querySelector('.kw')) throw new Error('The card for ' + slug + ' has no window painted in it.');
  const dot = [...card.querySelectorAll('.swatches button')].find((button) => button.dataset.index === index);
  if (!dot) throw new Error('The card for ' + slug + ' has no dot for its theme at index ' + index + '.');
  dot.click();
  return new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => {
    const r = frame.getBoundingClientRect();
    const d = devicePixelRatio;
    const left = Math.ceil((r.left + scrollX) * d) / d;
    const top = Math.ceil((r.top + scrollY) * d) / d;
    const right = Math.floor((r.right + scrollX) * d) / d;
    const bottom = Math.floor((r.bottom + scrollY) * d) / d;
    done({ x: left, y: top, width: right - left, height: bottom - top });
  })));
})()`;
}

function isInside(parent, child) {
  const path = relative(parent, child);
  return path === '' || (!path.startsWith('..') && !path.startsWith('/'));
}

/**
 * Renders the changed `families` into a page, screenshots each planned theme, and writes the
 * PNGs and manifest under `outDir`. `toolingRoot` supplies the validator and static files.
 */
export async function writePreviews({ families, outDir, toolingRoot, now = new Date(), log = console.log }) {
  const vendor = await loadVendor(toolingRoot);
  const previews = await collectPreviews({ families, vendor });
  const { shots, truncated } = planShots(families, previews);
  resetOutDir(outDir);
  if (shots.length === 0) {
    log('No changed theme has a preview to draw.');
    return writeEmptyManifest(outDir);
  }
  if (truncated) log(`Only the first ${MAX_SHOTS} screenshots are taken.`);

  const index = {
    indexVersion: 1,
    generatedAt: now.toISOString(),
    checkedWith: typeof vendor?.version === 'string' ? vendor.version : 'none',
    families: buildEntries(families),
    withdrawn: [],
  };
  const siteDir = mkdtempSync(join(tmpdir(), 'kepler-themes-preview-'));
  try {
    writeFileSync(join(siteDir, 'index.html'), renderLandingPage(index, previews));
    copySiteFiles(join(toolingRoot, 'site'), siteDir);
    const png = await withChrome(async (openPage) => {
      const page = await openPage();
      await page.navigate(pathToFileURL(join(siteDir, 'index.html')).href);
      await page.evaluate(SCREENSHOT_PAGE);
      const images = [];
      for (const shot of shots) {
        const clip = await page.evaluate(cardScript(shot.slug, shot.index), { awaitPromise: true });
        if (!clip) throw new Error(`The page has no card for ${shot.slug}.`);
        images.push(await page.screenshot(clip));
      }
      return images;
    });
    png.forEach((bytes, i) => writeFileSync(join(outDir, `${i + 1}.png`), bytes));
  } finally {
    rmSync(siteDir, { recursive: true, force: true });
  }
  const manifest = buildManifest(shots, { truncated });
  writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  log(`Wrote ${shots.length} screenshot${shots.length === 1 ? '' : 's'} and manifest.json to ${outDir}.`);
  for (const [i, s] of shots.entries()) log(`  ${i + 1}.png  ${s.family}, ${s.theme}`);
  return manifest;
}

export function parseArgs(argv) {
  const args = { base: 'origin/main', out: null, root: process.cwd() };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag !== '--base' && flag !== '--root' && flag !== '--out') throw new Error(`Unknown argument ${flag}`);
    const value = argv[++i];
    if (!value) throw new Error(`${flag} needs a value.`);
    if (flag === '--base') args.base = value;
    else if (flag === '--root') args.root = resolve(value);
    else args.out = resolve(value);
  }
  args.out ??= join(process.cwd(), 'preview');
  return args;
}

if (import.meta.main) {
  // The validator and the page's static files always come from this checkout (the trusted one
  // in CI). The gallery under --root is read as data and never imported.
  const toolingRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  try {
    const args = parseArgs(process.argv.slice(2));
    // The output directory is emptied first, so it must not be able to hold the gallery or the tooling.
    for (const keep of [args.root, toolingRoot, process.cwd()]) {
      if (isInside(args.out, keep)) throw new Error(`Refusing to use ${args.out} as the output: it contains ${keep}.`);
    }
    const changed = gitChangedFiles(args.root, args.base);
    const { families } = loadGallery(args.root);
    const touched = changedSlugsOf(changed);
    const picked = drawable(families.filter((f) => touched?.has(f.slug)));
    if (picked.length === 0) {
      resetOutDir(args.out);
      writeEmptyManifest(args.out);
      console.log(changed ? 'No theme changed, so there is nothing to preview.' : `The base ${args.base} is not in the checkout, so there is nothing to compare.`);
    } else {
      // Chrome is only needed, and only looked for, when a changed theme has something to draw.
      await writePreviews({ families: picked, outDir: args.out, toolingRoot });
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
