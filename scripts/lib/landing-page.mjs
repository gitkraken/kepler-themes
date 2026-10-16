const REPO_URL = 'https://github.com/gitkraken/kepler-themes';

// Family names, authors and descriptions come from contributors' files, so every value is
// escaped before it reaches the page.
function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

function themeNames(family) {
  return Array.isArray(family?.themes)
    ? family.themes.map((t) => t?.name).filter((name) => typeof name === 'string')
    : [];
}

function familyItem(entry) {
  const themes = themeNames(entry.family);
  return `      <li>
        <a href="${REPO_URL}/tree/main/themes/${encodeURIComponent(entry.slug)}">${escapeHtml(entry.name)}</a>
        <span class="by">by ${escapeHtml(entry.author)}</span>
        <p>${escapeHtml(entry.family?.description)}</p>
        ${themes.length > 0 ? `<p class="themes">${themes.map(escapeHtml).join(', ')}</p>` : ''}
      </li>`;
}

/** The page served at the site's root, so the bare address explains itself instead of a 404. */
export function renderLandingPage(index) {
  const families = [...index.families].sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
  );
  const count = families.length === 1 ? '1 theme family' : `${families.length} theme families`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kepler theme gallery</title>
  <style>
    :root { color-scheme: light dark; --fg: #1f2328; --muted: #59636e; --bg: #ffffff; --line: #d1d9e0; --link: #6639ba; }
    @media (prefers-color-scheme: dark) {
      :root { --fg: #e6edf3; --muted: #9198a1; --bg: #0d1117; --line: #3d444d; --link: #b392f0; }
    }
    body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.5 system-ui, sans-serif; }
    main { max-width: 42rem; margin: 0 auto; padding: 3rem 1rem; }
    h1 { font-size: 1.75rem; margin: 0 0 0.5rem; }
    a { color: var(--link); }
    .lede, .by, .themes, footer { color: var(--muted); }
    ul { list-style: none; padding: 0; margin: 2rem 0; }
    li { border-top: 1px solid var(--line); padding: 1rem 0; }
    li > a { font-weight: 600; }
    li p { margin: 0.25rem 0 0; }
    .themes { font-size: 0.875rem; }
    nav { display: flex; flex-wrap: wrap; gap: 1.5rem; }
  </style>
</head>
<body>
  <main>
    <h1>Kepler theme gallery</h1>
    <p class="lede">Community themes for Kepler. Browse and install them from Kepler's Add a theme dialog.</p>
    <nav><a href="${REPO_URL}">Contribute a theme</a><a href="v1/index.json">Index (JSON)</a></nav>
    <h2>${escapeHtml(count)}</h2>
    <ul>
${families.map(familyItem).join('\n')}
    </ul>
    <footer>Updated ${escapeHtml(index.generatedAt.slice(0, 10))}, checked with Kepler ${escapeHtml(index.checkedWith)}.</footer>
  </main>
</body>
</html>
`;
}
