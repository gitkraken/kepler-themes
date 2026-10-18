# Contributing a theme

Thank you for adding to the gallery. The checks below run on every pull request, and you can run them yourself first:

```
node scripts/check.mjs
```

It needs Node 24.2 or later and nothing else installed. Add `--fix` to rewrite formatting for you. Pass `--base <ref>` to compare with a branch other than `origin/main`, and `--root <dir>` to check a gallery checked out elsewhere.

## Make a theme

Write the family file by hand, or use Create a theme in Kepler and save the result. Either way you get a file in your Kepler themes folder, with each theme listing the colors it changes. Kepler's own checks run when you save, so start there.

## Folder layout

```
themes/
  my-theme/
    my-theme.json     the family file
    gallery.json      listing data
```

- The folder name is the family's slug: lowercase letters and digits joined by single hyphens, such as `my-theme`.
- The folder holds exactly those two files. No images, no extras. Previews are drawn from your colors.
- The family file must be plain JSON, no comments, formatted with two spaces and a trailing newline. `node scripts/check.mjs --fix` does this.
- It can be at most 64 KB.

### The family file

These keys are required: `name`, `version`, `author`, `description`, `license`, `themes`. `schemaVersion` may be left out or set to 1. `homepage` is optional and must be an https URL. No other top-level keys are allowed. Kepler's format documents the themes themselves.

### gallery.json

```json
{
  "maintainers": ["your-github-login"],
  "tags": ["purple", "vivid"]
}
```

- `maintainers`: one to twenty GitHub logins, each listed once. They are credited in the gallery and are who to ask about the family. They do not get to merge: the gallery team reviews every pull request (see Review).
- `tags`: at most five, each from the list in [tags.json](tags.json).

## Versions

Every family states a semantic version in `version`, and every change to it must raise that version. Semantic versioning 2.0.0 decides what counts as higher, so `1.4.2` to `1.4.3`, `1.5.0` or `2.0.0` all pass, while `1.4.2` to `1.4.2` or `1.4.1` fail. A prerelease such as `2.0.0-beta.1` ranks below `2.0.0`.

A new family may start at any version. An unchanged file keeps its version. If you change a published family without raising the version, the check fails with:

```
Raise version above 1.4.2 to publish this change (it is 1.4.2 now).
```

This is what lets "you have 1.4.2, the gallery has 1.5.0" always be true.

## Licenses

`license` must be one of: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, CC0-1.0, CC-BY-4.0, Unlicense, MPL-2.0. The license applies to your theme file, which people copy to their machines, so only choose one you have the right to grant.

If your theme is a port of another theme, the original's license must allow the port. Credit the original and its author in `description`, and link it from `homepage` when you can.

## Names and ids

- A family or theme name may not contain "Kepler" or "GitKraken", in any case. Those names belong to the products. First-party families, which the gallery team lists in `first-party.json`, are exempt. Only the gallery team adds to that list.
- Do not name a theme after another project without that project's okay. Catppuccin, Dracula and Nord each maintain official ports for the apps they support. A community port of one of them needs its maintainers' okay, or a different name.
- No offensive names or descriptions.
- Every theme id must be unique across the whole gallery and must not clash with a theme built into Kepler. The check reports a clash.
- **Theme ids never change once published.** People's settings store the id of the theme they picked, so changing it silently resets their choice. Names are free to change.

## Review

The gallery team reviews and merges every pull request. It looks at the things the checks cannot judge: impersonating names, offensive text, ports of projects with official ports, and license honesty.

- A new family, a rename, an id change or a change to `maintainers` gets a closer look from the gallery team.
- We aim to respond within 5 working days of the pull request being ready.
- A change to a family you do not maintain needs one of that family's listed maintainers to agree in the pull request before it merges. The check report names them.
- Removing a family needs its slug in `withdrawn.json`. Removing a theme id is flagged, because people who use it keep their installed copy but stop getting updates.

## Withdrawal

A family leaves the gallery when its maintainer asks, when a license or trademark claim is upheld, or when it is abandoned past repair. It is deleted from `themes/` and its slug is added to `withdrawn.json`.

- The slug stays reserved, so nobody else can register it and inherit installs.
- Installed copies are left alone. They are users' own files. Kepler stops offering updates for them and says the theme is no longer in the gallery.

## What the checks cover

Layout, formatting, size, the required fields and the license list, the version rule, unique ids, reserved names, `gallery.json`, the limits the Kepler app puts on the published index (500 families, 8 MB), and files that are too big or not regular files. When Kepler's own validator is present in `vendor/`, it also checks the file against Kepler's schema (no errors and no notices) and the contrast of every color pair. Without it, those checks are skipped locally with a warning, and fail in CI.

The report also has a Review notes section for the maintainer, theme id and first-party points above, and a Scope section. Neither fails the check. Scope flags a change to files outside `themes/`, which the gallery team reviews as code because CI runs the tooling from `main`, not from your pull request.

Later phases will add a preview image on each pull request and a nightly re-check against Kepler's next palettes.
