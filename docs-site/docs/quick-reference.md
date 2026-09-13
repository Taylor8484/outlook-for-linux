# Quick Reference

This quick reference is a condensed cheat-sheet for the most common commands, the configuration file location, key options, and troubleshooting entry points for Outlook for Linux. Each item links to the fuller documentation page for detail.

## Common Commands

Development and build commands, run from the repository root:

| Command | What it does |
|---------|--------------|
| `npm start` | Run the app in development mode (with `--trace-warnings`) |
| `npm run lint` | Run ESLint validation (required before commits) |
| `npm run test:unit` | Run the unit tests |
| `npm run test:e2e` | Run the Playwright end-to-end tests |
| `npm run pack` | Development build without packaging (`electron-builder --dir`) |
| `npm run dist:linux` | Build Linux packages (AppImage, deb, rpm, tar.gz) |
| `npm run generate-ipc-docs` | Regenerate the IPC API docs after changing an IPC channel |
| `npm run generate-config-docs` | Regenerate the configuration reference after changing an option |
| `npm run generate-release-info` | Regenerate the release information file |

See [Contributing](development/contributing.md) for the full development workflow.

## Configuration File Location

User configuration lives in `~/.config/outlook-for-linux/config.json` for the deb, rpm, AppImage, and tar.gz packages. When running from source with `npm start`, Electron uses `~/.config/Electron/config.json` instead.

A system-wide file at `/etc/outlook-for-linux/config.json` is also read, with the user file taking precedence. See [Configuration Options](configuration.md) for the complete list of options, types, and defaults.

## Frequently Used Options

Common options and what they control. See the full reference for current types and defaults:

| Option | Purpose |
|--------|---------|
| `performance.disableGpu` | Turn GPU/hardware acceleration off. On Wayland the app already disables the GPU by default, so set this to `false` to force it back on; the main lever for blank-window and rendering issues |
| `notificationMethod` | Choose how notifications are delivered: `web`, `electron`, or `custom` |
| `window.closeOnCross` | Quit the app on window close instead of minimising to tray |
| `tray.enabled` | Show or hide the system tray icon |
| `platform.chromeUserAgent` | Override the user agent sent to Outlook and sign-in pages |
| `proxyServer` | Route traffic through a proxy in `address:port` form |

For every option, including the ones not listed here, see [Configuration Options](configuration.md).

## Troubleshooting Quick Links

Jump straight to the most common fixes in the [Troubleshooting Guide](troubleshooting.md):

| Symptom | Section |
|---------|---------|
| Blank or black window on Wayland | [Wayland / Display Issues](troubleshooting.md#wayland--display-issues) |
| Notifications missing or disappearing | [Notifications](troubleshooting.md#notifications) |
| Microsoft login or SSO problems | [Intune / SSO](intune-sso.md) |
| Corporate proxy or certificate errors | [Certificate Management](certificate.md) |
