# vendor

`kepler-theme-check.mjs` is Kepler's own validator, bundled into one file. Kepler's repo is internal, so its release job commits the file here by pull request. Nobody edits it by hand.

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
 *   themes: { id: string, contrastFailures: { label: string, ratio: number, min: number }[] }[],
 *   reservedIds: string[],
 * }> | {...same...}}
 */
export function checkThemeFamily(text) {}
```

- `errors` are anything that stops the file from loading. `notices` are the things the app only warns about (unknown keys, renamed tokens, a newer format).
- `themes` lists each theme that parsed, with every contrast check it fails against that release's palettes (terminal ANSI and syntax included).
- `reservedIds` are the theme ids in the file that clash with Kepler's built-in or bundled themes.
- The gallery fails on any error, any notice, any contrast failure and any reserved id.
- `version` ends up in the published index as `checkedWith`.
