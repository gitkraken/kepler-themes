# Maintaining the gallery

The gallery team reviews and merges every pull request. Family maintainers listed in `gallery.json` are credited and consulted, but they are not code owners and have no write access.

The gate (`check` in `.github/workflows/check.yml`) judges a pull request with the tooling from `main`, so a change to `scripts/`, `vendor/` or `package.json` cannot change how that pull request is judged. That does not cover `.github/`. On `pull_request`, GitHub runs the workflow file from the pull request itself, so a pull request that changes anything under `.github/` can change its own check and its report. Treat the status and report of any such pull request as untrusted, and review it as code. The comment workflow puts a banner on these pull requests (and on any that change files outside `themes/`) that the pull request cannot fake. The settings below keep the rest true. Whoever creates the repository should apply them before the first pull request.

## Checklist

- [ ] Create the team `@gitkraken/kepler-themes-maintainers` and give it write access. `.github/CODEOWNERS` names it for every path. Edit that file by hand when the team changes.
- [ ] Add a ruleset on `main` (Settings, Rules, Rulesets) that:
  - [ ] requires a pull request before merging, with at least 1 approval;
  - [ ] requires review from Code Owners;
  - [ ] dismisses stale approvals when new commits are pushed;
  - [ ] requires the status check `check` (the trusted job; do not require `tooling tests`, which is only advisory) to pass, with the branch up to date;
  - [ ] requires linear history;
  - [ ] blocks force pushes and deletions.
- [ ] Settings, Actions, General: set Workflow permissions to "Read repository contents and packages permissions", and leave "Allow GitHub Actions to create and approve pull requests" off.
- [ ] Settings, Actions, General: set "Fork pull request workflows from outside collaborators" to "Require approval for all outside collaborators".
- [ ] Settings, Pages: set Source to "GitHub Actions". `publish.yml` deploys the index from `main`.
- [ ] Settings, Environments, github-pages: limit deployment branches to `main`.
- [ ] Keep pinned actions current with Dependabot (`.github/dependabot.yml`) or by hand.

## Reviewing

- A pull request that touches `.github/`: its status and report are untrusted. Read the diff as code.
- A pull request that changes `scripts/` or `vendor/`: the `tooling tests` job must be green before you merge. It is the only job that runs the new tooling over every family, so a stricter validator that breaks a published family would otherwise break publishing after the merge.
- A change to a family: the report's Review notes section lists the family's maintainers from `main` and says whether the author is one of them. If not, a listed maintainer must agree in the pull request before you merge.
- A change to `first-party.json` grants a family the product names "Kepler" and "GitKraken". The gate reads that list from the pull request, so it passes such a change; the report's Review notes section names each family it newly lists. Only GitKraken's own families belong there.
- Removing a family needs its slug in `withdrawn.json`. Removing theme ids is flagged: people who use them keep their installed copy but lose updates.

## Why

The gate runs the version of the tooling on `main`, so editing `scripts/`, `vendor/` or `package.json` in a pull request does not affect that pull request's own result. Workflows are the exception, as described above. Per-family ownership cannot work: GitHub ignores code owners without write access, and an author cannot approve their own pull request, so the gallery team approves everything. Dismissing stale approvals stops a pushed change from riding on an earlier approval. The comment workflow holds a write token and never checks out the pull request, so keep it that way.
