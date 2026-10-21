export const REPO_URL = 'https://github.com/gitkraken/kepler-themes';
export const DOWNLOAD_URL = 'https://gitkraken.com/kepler/download';
export const SITE_URL = 'https://kepler-themes.gitkraken.dev/';

const DESCRIPTION = "Community themes for Kepler, GitKraken's agent-agnostic development environment. Browse themes made with Kepler, install them, or submit your own.";
const HERO_THEMES = 6;
const HEX = /^#[0-9a-f]{6}$/i;
const COLOR_KEYS = ['canvas', 'sunken', 'raised', 'ink', 'text', 'muted', 'edge', 'selected', 'selectedInk', 'brand', 'fill', 'onFill'];
const SYNTAX_KEYS = ['text', 'keyword', 'control', 'function', 'type', 'string', 'number', 'variable', 'comment'];

// Family names, authors and descriptions come from contributors' files, so every value is
// escaped before it reaches the page.
export function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

/**
 * JSON for an inline `<script type="application/json">` block. Escaping the characters that can
 * end or reopen the element (and the two line separators older parsers choke on) keeps any
 * family text from leaving the block; JSON.parse reads the escapes back.
 */
export function serializeForScript(value) {
  return JSON.stringify(value).replace(
    /[<>&\u2028\u2029]/g,
    (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pick(source, keys) {
  if (!isRecord(source)) return null;
  const out = {};
  for (const key of keys) {
    if (typeof source[key] !== 'string' || !HEX.test(source[key])) return null;
    out[key] = source[key];
  }
  return out;
}

/**
 * The preview a theme can be painted from, rebuilt from only the keys the page uses, or null when
 * anything is missing or is not a `#rrggbb` color. The values end up in style properties, so a bad
 * one drops the whole preview instead of being passed on.
 */
export function validPreview(preview) {
  if (!isRecord(preview) || (preview.polarity !== 'dark' && preview.polarity !== 'light')) return null;
  const colors = pick(preview.colors, COLOR_KEYS);
  const syntax = pick(preview.syntax, SYNTAX_KEYS);
  const terminal = pick(preview.terminal, ['background', 'foreground']);
  const ansi = isRecord(preview.terminal) ? preview.terminal.ansi : null;
  if (!colors || !syntax || !terminal) return null;
  if (!Array.isArray(ansi) || ansi.length !== 16 || !ansi.every((c) => typeof c === 'string' && HEX.test(c))) return null;
  return { polarity: preview.polarity, colors, terminal: { ...terminal, ansi: [...ansi] }, syntax };
}

/** Catalog order, which is also each family's number: oldest first, then by slug. */
function catalogOrder(families) {
  const day = (f) => (typeof f.addedAt === 'string' ? f.addedAt : '');
  return [...families].sort((a, b) => {
    const byDay = day(a) < day(b) ? -1 : day(a) > day(b) ? 1 : 0;
    return byDay || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0);
  });
}

function themesOf(entry, previews) {
  const themes = Array.isArray(entry.family?.themes) ? entry.family.themes : [];
  return themes
    .filter((t) => isRecord(t) && typeof t.id === 'string')
    .map((t) => ({
      id: t.id,
      name: typeof t.name === 'string' ? t.name : t.id,
      base: t.extends === 'dark' || t.extends === 'light' ? t.extends : null,
      preview: validPreview(previews?.[entry.slug]?.[t.id]),
    }));
}

function polarityOf(theme) {
  return theme.preview?.polarity ?? theme.base;
}

/** A family with exactly one dark and one light theme reads better as Dark and Light than as two long names. */
function isDarkLightPair(themes) {
  return themes.length === 2 && themes.some((t) => polarityOf(t) === 'dark') && themes.some((t) => polarityOf(t) === 'light');
}

function labelsOf(themes) {
  return isDarkLightPair(themes) ? themes.map((t) => (polarityOf(t) === 'dark' ? 'Dark' : 'Light')) : themes.map((t) => t.name);
}

function entryHtml({ entry, themes }, number) {
  const slug = escapeHtml(entry.slug);
  const labels = labelsOf(themes);
  const first = themes[0];
  const hidden = first?.preview ? '' : ' hidden';
  const tags = Array.isArray(entry.tags) ? entry.tags.filter((t) => typeof t === 'string') : [];
  // A family none of whose themes carries a preview has no window to paint.
  const view = themes.some((t) => t.preview)
    ? `            <div class="view"${hidden}><div class="win" role="img" aria-label="${escapeHtml(first?.name)} preview"${hidden}></div></div>\n`
    : '';
  const switcher =
    themes.length > 1
      ? `                <div class="seg" role="group" aria-label="${escapeHtml(entry.name)} variant">
${themes
  .map((_, i) => `                  <button type="button" aria-pressed="${i === 0}" data-index="${i}">${escapeHtml(labels[i])}</button>`)
  .join('\n')}
                </div>
`
      : '';
  return `          <article class="entry" data-family="${slug}" aria-labelledby="t-${slug}">
${view}            <div class="body">
              <div class="title">
                <span class="orb" aria-hidden="true"></span>
                <div><h3 id="t-${slug}">${escapeHtml(entry.name)}</h3><p class="by">by ${escapeHtml(entry.author)}</p></div>
                <span class="no">No. ${String(number).padStart(3, '0')}</span>
              </div>
              <p class="desc">${escapeHtml(entry.family?.description)}</p>
              <dl class="readout">
                <div><dt>Version</dt><dd>${escapeHtml(entry.version)}</dd></div>
                <div><dt>License</dt><dd>${escapeHtml(entry.family?.license)}</dd></div>
                <div><dt>Themes</dt><dd>${escapeHtml(isDarkLightPair(themes) ? labels.join(', ') : themes.length)}</dd></div>
                <div><dt>Contrast</dt><dd class="pass">All pass</dd></div>
              </dl>
              <div class="spectrum">
                <div class="bar" aria-hidden="true"></div>
                <div class="cap"><span>Spectrum</span><span class="spec-name">${escapeHtml(first?.name)}</span></div>
              </div>
              <div class="foot">
${switcher}                <div class="tags">${tags.map((t) => `<span>${escapeHtml(t)}</span>`).join('')}</div>
              </div>
            </div>
          </article>`;
}

/** The featured families' painted themes first, then the rest in catalog order, at most six. */
function heroThemes(ordered) {
  const rank = (e) => (Number.isInteger(e.entry.featured) ? e.entry.featured : Infinity);
  return ordered
    .map((e, position) => ({ e, position }))
    .sort((a, b) => (rank(a.e) === rank(b.e) ? a.position - b.position : rank(a.e) < rank(b.e) ? -1 : 1))
    .flatMap(({ e }) => e.themes.filter((t) => t.preview).map((t) => ({ slug: e.entry.slug, id: t.id })))
    .slice(0, HERO_THEMES);
}

/**
 * The page served at the site's root. `previews` maps a family slug to its themes' preview colors
 * by theme id (what the vendored validator reports); a theme without one is still listed, just
 * not painted.
 */
export function renderLandingPage(index, previews = {}) {
  const ordered = catalogOrder(index.families).map((entry) => ({ entry, themes: themesOf(entry, previews) }));
  const themeCount = ordered.reduce((sum, e) => sum + e.themes.length, 0);
  const checked = index.checkedWith && index.checkedWith !== 'none' ? index.checkedWith : null;
  const next = String(ordered.length + 1).padStart(3, '0');
  const data = {
    families: ordered.map(({ entry, themes }) => ({
      slug: entry.slug,
      name: typeof entry.name === 'string' ? entry.name : entry.slug,
      tags: Array.isArray(entry.tags) ? entry.tags.filter((t) => typeof t === 'string') : [],
      themes: themes.map((t) => ({ id: t.id, name: t.name, polarity: polarityOf(t), preview: t.preview })),
    })),
    hero: heroThemes(ordered),
  };
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="color-scheme" content="dark">
  <meta name="description" content="${DESCRIPTION}">
  <title>Kepler Themes</title>
  <meta property="og:type" content="website">
  <meta property="og:url" content="${SITE_URL}">
  <meta property="og:site_name" content="Kepler Themes">
  <meta property="og:title" content="Kepler Themes">
  <meta property="og:description" content="${DESCRIPTION}">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="Kepler Themes">
  <meta name="twitter:description" content="${DESCRIPTION}">
  <link rel="icon" href="brand/logo.svg" type="image/svg+xml">
  <link rel="stylesheet" href="brand/kep.css">
  <link rel="stylesheet" href="site.css">
</head>
<body>
  <canvas id="sky" aria-hidden="true"></canvas>
  <div class="nebula" aria-hidden="true"></div>

  <div class="page">
    <header class="wrap top">
      <img class="logo" src="brand/logo.svg" alt="" width="34" height="34">
      <span class="name">Kepler <span>Themes</span></span>
      <nav aria-label="Gallery">
        <a href="#catalog">Catalog</a>
        <a href="#launch">Submit a theme</a>
        <a href="${REPO_URL}">GitHub</a>
      </nav>
      <a class="get" href="${DOWNLOAD_URL}">Get Kepler</a>
    </header>

    <main>
      <div class="wrap hero">
        <div class="hero-copy">
          <span class="eyebrow">Community themes for Kepler</span>
          <h1>A whole sky of <span class="lit">color</span> for your workspace.</h1>
          <p class="lede">Kepler is GitKraken's agent-agnostic development environment. Describe a look to your agent, and it builds the theme for Kepler itself. Here's what people have made.</p>
          <div class="ctas">
            <a class="btn primary" href="${DOWNLOAD_URL}">Build yours in Kepler</a>
            <a class="btn ghost" href="#catalog">Explore the theme catalog</a>
          </div>
          <p class="submit">Made one you love? <a href="#launch">See how to submit it <span aria-hidden="true">›</span></a></p>
          <p class="where">Already have Kepler? Open <b>Settings</b> <i>›</i> <b>Appearance</b> <i>›</i> <b>Add a theme</b> <i>›</i> <b>Browse the gallery</b></p>
        </div>
        <div class="system" id="system">
          <svg class="orbits" viewBox="0 0 100 100" aria-hidden="true">
            <ellipse class="orbit" cx="50" cy="50" rx="36" ry="12" transform="rotate(-18 50 50)"/>
            <ellipse class="orbit dash" cx="50" cy="50" rx="48" ry="18" transform="rotate(-18 50 50)"/>
          </svg>
          <div id="hero-kep" class="k2-glow" data-state="idle"></div>
        </div>
      </div>

      <section id="catalog">
        <div class="wrap">
          <div class="head">
            <div>
              <span class="eyebrow">The catalog</span>
              <h2>Every theme, observed in its own light.</h2>
              <p>Each entry is drawn from the theme file itself, so what you see is what Kepler will paint.</p>
            </div>
            <p class="tally"><b>${ordered.length}</b> ${ordered.length === 1 ? 'family' : 'families'}, <b>${themeCount}</b> ${themeCount === 1 ? 'theme' : 'themes'}${checked ? `<br>checked with Kepler ${escapeHtml(checked)}` : ''}</p>
          </div>
          <div class="filters" role="search" aria-label="Themes" hidden>
            <input type="search" id="find" placeholder="Search by name or tag" aria-label="Search themes by name or tag" autocomplete="off" spellcheck="false">
            <div class="seg" role="group" aria-label="Show">
              <button type="button" aria-pressed="true" data-polarity="">All</button>
              <button type="button" aria-pressed="false" data-polarity="dark">Dark</button>
              <button type="button" aria-pressed="false" data-polarity="light">Light</button>
            </div>
            <p class="count" aria-live="polite"></p>
          </div>
          <p class="none" hidden>No themes match. <button type="button">Clear the search</button></p>
          <div class="catalog">
${ordered.map((e, i) => `${entryHtml(e, i + 1)}\n\n`).join('')}          <article class="entry vacant" aria-labelledby="t-vacant">
            <div id="vacant-kep" data-state="listening"></div>
            <h3 id="t-vacant">No. ${next} is waiting.</h3>
            <p>Made a theme you love? Add its folder and open a pull request, and it joins the catalog.</p>
            <code>themes/your-theme/</code>
            <a href="#launch">How submitting works</a>
          </article>
          </div>
        </div>
      </section>

      <section id="launch" class="launch">
        <div class="wrap">
          <div class="head">
            <div>
              <span class="eyebrow">Submitting</span>
              <h2>Four steps from your themes folder to everyone's.</h2>
            </div>
            <a href="${REPO_URL}/blob/main/CONTRIBUTING.md">Read CONTRIBUTING.md</a>
          </div>
          <ol class="track">
            <li><span class="t">T−3</span><h3>Make it in Kepler</h3><p>Ask an agent to create a theme, or edit a family file in your themes folder. Kepler repaints as you save. New to Kepler? <a href="${DOWNLOAD_URL}">Download it</a>.</p></li>
            <li><span class="t">T−2</span><h3>Open a pull request</h3><p>Add <code>themes/&lt;slug&gt;/</code> with your family file and a <code>gallery.json</code> that names you as its maintainer.</p></li>
            <li><span class="t">T−1</span><h3>Checks and review</h3><p>Kepler's own validator checks the format and every contrast pair. The gallery team reviews names and licenses.</p></li>
            <li><span class="t">Launch</span><h3>In every Kepler</h3><p>On merge the catalog rebuilds, and your theme appears in Kepler's gallery within the hour.</p></li>
          </ol>
        </div>
      </section>
    </main>

    <footer class="horizon">
      <div class="wrap inner">
        <span class="sleeper"><span id="footer-kep" data-state="asleep"></span>Catalog updated ${escapeHtml(String(index.generatedAt ?? '').slice(0, 10))}${checked ? `, checked with Kepler ${escapeHtml(checked)}` : ''}</span>
        <span><a href="${DOWNLOAD_URL}">Download Kepler</a> <i>·</i> <a href="v1/index.json">Index (JSON)</a></span>
      </div>
    </footer>
  </div>

  <script type="application/json" id="gallery-data">${serializeForScript(data)}</script>
  <script src="brand/kep.js"></script>
  <script src="site.js"></script>
</body>
</html>
`;
}
