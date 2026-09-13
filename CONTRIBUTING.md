# Contributing to Outlook for Linux

Thanks for considering a contribution. This guide covers the basics.

## Quick Start

1. **Fork** [Taylor8484/outlook-for-linux](https://github.com/Taylor8484/outlook-for-linux)
2. **Clone** your fork and create a feature branch from `develop-outlook`
3. **Make changes** (entry point: `app/index.js`; each `app/` subfolder has a README explaining its purpose)
4. **Lint and test** (see below)
5. **Open a pull request** against the `develop-outlook` branch

## Development Setup

**Prerequisites:** Node.js (see `.nvmrc`) and npm.

```bash
git clone https://github.com/<your-username>/outlook-for-linux.git
cd outlook-for-linux
git checkout develop-outlook
npm ci

# Run from source
npm start

# Lint (required before every commit)
npm run lint

# Unit tests
npm run test:unit

# End-to-end tests (Playwright)
npm run test:e2e
```

## Building Packages

```bash
npm run dist:linux:x64    # deb, rpm, tar.gz and AppImage for x64
npm run dist:linux:snap   # snap (needs snapcraft)
```

Built packages are written to `dist/`.

## Commit Messages

Releases are managed by [release-please](https://github.com/googleapis/release-please),
which builds the changelog from [Conventional Commits](https://www.conventionalcommits.org/).
Please prefix commits and PR titles with a type such as `feat:`, `fix:`, `docs:`,
`refactor:`, `ci:` or `chore:`.

## Testing Pull Request Builds

Each pull request builds Linux, macOS and Windows packages in GitHub Actions.
Open the PR's **Checks** tab, select a completed workflow run, and download the
artifact for your platform from the **Artifacts** section (you need to be signed
in to GitHub; artifacts are kept for 30 days).
