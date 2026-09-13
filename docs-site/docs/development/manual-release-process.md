# Release Process

## Release Cadence

Outlook for Linux does not follow a fixed release schedule. Instead, releases are driven by what has changed and how urgent those changes are. The general approach is to batch changes into meaningful releases while keeping users safe from security issues and regressions.

### What triggers a release

Releases fall into a few broad categories, roughly ordered by urgency:

**Immediate releases** happen for runtime security vulnerabilities in dependencies and regressions that break core functionality (sign-in, notifications, loading Outlook). These go out as soon as the fix is verified because the cost of waiting outweighs the noise of an extra update.

**Batched releases** are the normal pattern. Feature work, non-critical bug fixes, and build-time dependency updates accumulate until there is a meaningful set of changes worth shipping.

**Pre-releases** are occasionally published to test significant changes (Electron upgrades, Wayland fixes) before promoting to stable. These are tagged as pre-release on GitHub.

### Periods of higher frequency

There are times when releases come faster than usual. This typically happens when hunting platform-specific bugs (such as Chromium/Wayland compatibility issues) where a fix for one configuration can break another, requiring rapid iteration. The npm ecosystem also generates security advisories frequently; runtime-affecting ones ship immediately while build-time-only ones get batched.

### Distribution

Every release is published on [GitHub Releases](https://github.com/Taylor8484/outlook-for-linux/releases):

| Artifact | Update path | Notes |
|----------|-------------|-------|
| AppImage | In-app auto-update | Uses electron-updater and the `latest-linux*.yml` metadata attached to the release |
| deb | Manual download and install | Install the new package over the old one |
| rpm | Manual download and install | Install the new package over the old one |
| tar.gz | Manual download and extract | No `.desktop` file is shipped |

### The soft promise

The project aims to balance shipping fixes quickly with respecting users' time. Security and regressions will always be fast-tracked, but feature work and non-critical improvements will be batched together rather than shipped individually. The goal is meaningful releases, not frequent ones.

## Overview

This project uses [release-please](https://github.com/googleapis/release-please) for automated release management. Release-please monitors conventional commits on the `develop-outlook` branch and automatically maintains a Release PR with version bumps and a generated `CHANGELOG.md`.

### How it works

1. Contributors merge PRs with [conventional commit](https://www.conventionalcommits.org/) messages
2. release-please automatically creates (or updates) a Release PR that includes:
   - Version bump in `package.json`
   - Updated `CHANGELOG.md` with categorised entries
   - Updated `appdata.xml` with a new release entry (via a custom workflow step)
   - Updated `package-lock.json`
3. When the maintainer is ready to release, they merge the Release PR
4. On merge, the build workflow creates a draft GitHub Release with artifacts
5. The maintainer promotes the draft to a full release

### Conventional commit format

Release-please determines the version bump type from commit prefixes:

| Prefix | Bump | Example |
|--------|------|---------|
| `feat:` | minor | `feat: add mailto: handler` |
| `fix:` | patch | `fix: resolve login redirect loop` |
| `feat!:` or `BREAKING CHANGE:` | major | `feat!: drop Node 18 support` |
| `chore:`, `docs:`, `ci:`, etc. | patch (if included) | `chore: update dependencies` |

### Versioning convention

The project follows standard [semantic versioning](https://semver.org/) as enforced by release-please. A `feat:` commit bumps the minor digit, a `fix:` bumps the patch digit, and a breaking change bumps the major digit. Pick conventional commit prefixes intentionally, since they directly determine the version bump.

## Quick Start

### Releasing (merge the Release PR)

1. Go to the [Pull Requests](https://github.com/Taylor8484/outlook-for-linux/pulls) page
2. Find the auto-generated Release PR (titled like "chore(develop-outlook): release X.Y.Z")
3. Review the changelog and version bump
4. Merge the PR
5. The build workflow triggers automatically and creates a draft GitHub Release
6. Promote the draft to a full release when ready

That's it. No scripts to run, no manual version bumping.

### Customising before release

If you need to adjust the release before merging:

- **Edit the changelog**: Modify `CHANGELOG.md` directly in the Release PR
- **Override the version**: Edit `package.json` in the Release PR (release-please will respect manual overrides)
- **Add entries**: Additional conventional commits to `develop-outlook` will automatically update the Release PR

## After PR Merge

When the Release PR merges to `develop-outlook`:
- Build workflow detects the version change
- Builds deb, rpm, AppImage and tar.gz artifacts
- Creates a GitHub draft release with the artifacts attached

Then:
1. Review the draft release notes and artifacts
2. Promote the GitHub draft to a full release (optionally flagged as a pre-release first)
3. Clear the pre-release flag once the release has soaked: `gh release edit vX.Y.Z --prerelease=false`

:::warning The auto-updater follows the latest full release
AppImage auto-update resolves the latest published release. A release left as a draft never reaches users, and a pre-release is skipped by the `releases/latest` endpoint until its flag is cleared.
:::

## Changelog Categories

Changes in `CHANGELOG.md` are automatically categorised based on conventional commit prefixes:

- **Features** — `feat:` prefix
- **Bug Fixes** — `fix:` prefix
- **Performance** — `perf:` prefix
- **Security** — `security:` prefix
- **Dependencies** — `deps:` prefix
- **Code Improvements** — `refactor:` prefix
- **Documentation** — `docs:` prefix
- **CI/CD** — `ci:` prefix
- **Testing** — `test:` prefix
- **Maintenance** — `chore:` prefix

## Configuration

Release-please is configured via two files in the repository root:

- **`release-please-config.json`** — Release type, changelog sections, and behaviour
- **`.release-please-manifest.json`** — Tracks the current version

The GitHub Actions workflow is at `.github/workflows/release-please.yml`.

### appdata.xml updates

Release-please does not natively support `appdata.xml`. A custom script (`scripts/update-appdata-xml.js`) runs as part of the release-please workflow to:
1. Read the new version from `package.json`
2. Extract changelog entries from `CHANGELOG.md`
3. Insert a new `<release>` entry into `io.github.taylor8484.outlook_for_linux.appdata.xml`

This keeps the AppStream metadata in sync with each release, which the electron-builder release info generation also depends on.

## Workflow Diagram

```text
Conventional commits land on develop-outlook
     ↓
release-please creates/updates Release PR
     ↓                (includes version bump, CHANGELOG.md, appdata.xml)
Maintainer merges Release PR
     ↓
Build triggers automatically
     ↓
Draft GitHub Release (deb, rpm, AppImage, tar.gz)
     ↓
Promote draft → Full release → AppImage auto-update picks it up
```

## Tips

**Check pending changes for the next release:**
Look at the open Release PR to see what will be included.

**Force a specific version:**
Edit `package.json` in the Release PR branch to set a specific version.

**Skip a commit from the changelog:**
Use a commit message without a conventional commit prefix, or use the `chore:` prefix (included in Maintenance category).

## Benefits

- **Minimal manual steps** — No scripts to run, no version bumping, no changelog staging
- **Conventional commits** — Contributors already follow this convention, so no behaviour change
- **Auto-categorised changelog** — Changes grouped by type in `CHANGELOG.md`
- **Always up to date** — Release PR updates automatically with each new commit
- **Full control** — Maintainer decides when to merge and release
- **Standard tooling** — release-please is widely adopted and well-maintained

## Related Documentation

- [release-please documentation](https://github.com/googleapis/release-please)
- [Conventional Commits specification](https://www.conventionalcommits.org/)
- [Release Info Generation](release-info.md) — Technical details of release info script
- [ADR 023: Release Automation Tooling](adr/023-release-automation-tooling.md) — Why release-please was adopted
