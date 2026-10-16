# vendor

`kepler-theme-check.mjs` is Kepler's own validator, bundled into one file. Kepler's repo is internal, so the bundle is built there and committed here by pull request whenever Kepler's theme format or contrast rules change. Nobody edits it by hand. For now a Kepler maintainer opens those pull requests; Kepler's release job will open them once it can.

`scripts/check.mjs` imports it when it exists. Until it does, schema and contrast checks are skipped with a warning locally and fail the check in CI (`CI` set), so CI can never skip them silently.

## Contract

The bundle is an ES module that exports:

```js
export const version = '1.42.0'; // the Kepler release whose palettes it checks against

/**
 * @param {string} text the family file exactly as it is on disk
 * @returns {Promise<{
 *   ok: boolean,
 *   errors: { message: string }[],
 *   notices: { message: string }[],
 *   themes: {
 *     id: string,
 *     contrastFailures: { label: string, ratio: number, min: number }[],
 *     preview: {
 *       polarity: 'dark' | 'light',
 *       colors: { canvas, sunken, raised, ink, text, muted, edge, selected, selectedInk, brand, fill, onFill },
 *       terminal: { background, foreground, ansi: string[16] },
 *       syntax: { text, keyword, control, function, type, string, number, variable, comment },
 *     }, // every color is a '#rrggbb' string
 *   }[],
 *   reservedIds: string[],
 * }> | {...same...}}
 */
export function checkThemeFamily(text) {}
```

- `errors` are anything that stops the file from loading. `notices` are the things the app only warns about (unknown keys, renamed tokens, a newer format).
- `themes` lists each theme that parsed, with every contrast check it fails against that release's palettes (terminal ANSI and syntax included).
- `preview` is the theme as Kepler resolves it, in the few colors the gallery's page needs to paint a Kepler window, a planet and a color strip in the theme's own look. The page checks every value against `#rrggbb` and drops a theme's preview if any is off. An older bundle without `preview` still works: the page lists those themes without painting them. Previews are not written to the published index.
- `reservedIds` are the theme ids in the file that clash with Kepler's built-in or bundled themes.
- The gallery fails on any error, any notice, any contrast failure and any reserved id.
- `version` ends up in the published index as `checkedWith`.
