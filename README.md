# Kepler themes

The community theme gallery for [Kepler](https://www.gitkraken.com/kepler), GitKraken's desktop app for agent-driven Git work.

Each folder under `themes/` is one theme family: a dark theme, a light theme, or a few contrasts of one look. Kepler reads the gallery's published index, shows the families in a browsable grid, and installs the one you pick.

## Install a theme

In Kepler, open Settings, then Appearance, then Add a theme, then Browse the gallery. Pick a family, preview it, and install it. The family is copied into your own themes folder, so it keeps working offline and is yours to edit.

## What a theme is

A theme is a JSON file of colors and nothing else. It holds no code, no scripts and no images, so installing one cannot run anything on your machine. Every family file states its author, version and license, and each theme carries its own license in its file. The `LICENSE` file in this repo covers only the tooling in `scripts/`.

## Add your own

Read [CONTRIBUTING.md](CONTRIBUTING.md). In short: put a folder in `themes/`, run `node scripts/check.mjs`, and open a pull request.

## How it works

- `themes/<slug>/<slug>.json` is the family file Kepler installs.
- `themes/<slug>/gallery.json` lists the maintainers (credited, and who to ask about the family) and tags.
- `scripts/check.mjs` is the gate every pull request passes. In CI it runs from the base branch, not from the pull request. The gallery team reviews and merges every pull request.
- `scripts/build-index.mjs` builds `dist/v1/index.json`, plus a page at the site's root that lists the families in their own colors, which the publish workflow deploys to GitHub Pages when a change lands on `main`. The page is generated with preview colors taken from Kepler's validator, and those colors never go into the index.
- `site/` holds the page's static files: its styles and script, Kep (the mascot), the logo and the fonts. The fonts are under the SIL Open Font License; the license texts sit next to them in `site/fonts/`.
- `vendor/kepler-theme-check.mjs` is Kepler's own validator, committed here by Kepler's release job. See [vendor/README.md](vendor/README.md).

Maintainers: the repository settings this gallery's safety depends on are listed in [MAINTAINING.md](MAINTAINING.md).

Node 24.2 or later is the only requirement. There are no dependencies to install. `npm test` runs the tooling's tests.

## Trademarks

The code here is MIT-licensed, but the Kepler name, the Kepler logo and the Kep character are GitKraken trademarks and are not. See [TRADEMARKS.md](TRADEMARKS.md).
