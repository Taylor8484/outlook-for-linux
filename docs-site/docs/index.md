---
id: index
title: Outlook for Linux Documentation
slug: /
---

# Outlook for Linux

An unofficial Linux desktop wrapper around Outlook on the web (`https://outlook.office.com/mail/`), built with Electron. It adds the desktop integration the browser tab cannot provide on its own: a system tray icon with an unread badge, native notifications, global shortcuts, multiple account profiles, custom certificates and proxies, Intune SSO, security-key sign-in, and AppImage auto-updates.

:::info
Independent project, not affiliated with or endorsed by Microsoft. Some behaviour is constrained by what the Outlook web app exposes.
:::

Outlook for Linux is based on [teams-for-linux](https://github.com/IsmaelMartinez/teams-for-linux) by Ismael Martinez and its contributors, adapted to load Outlook instead of Microsoft Teams.

## Quick start

Download a package from the [Installation guide](installation.md), then launch:

```bash
outlook-for-linux
```

For a custom configuration, drop a JSON file at `~/.config/outlook-for-linux/config.json`. The full schema lives in the [Configuration reference](configuration.md). A minimal example:

```json
{
  "window": {
    "closeOnCross": false
  },
  "appearance": {
    "followSystemTheme": true
  },
  "tray": {
    "enabled": true
  }
}
```

If the app misbehaves, the [Troubleshooting guide](troubleshooting.md) covers the common cases (Wayland rendering, notifications, sign-in, certificates).

## Features

- **Outlook in its own window**, with a persistent session so you stay signed in
- **System tray icon** with an unread badge, and minimise-to-tray
- **Notifications**, delivered through the web app, native Electron notifications, or the built-in notification toast
- **Download notifications** when attachments finish saving
- **Multiple accounts**, either with the in-app profile switcher or as separate isolated instances
- **Enterprise sign-in**: Intune SSO, WebAuthn / FIDO2 security keys, client certificates with a PIN prompt, and SSO password pre-fill
- **Custom CA certificates and proxy** support for corporate networks
- **Global shortcuts, spellcheck, custom CSS, and zoom**
- **AppImage auto-updater**, cache management, and a GPU info window for diagnosing rendering problems
- **Flatpak background portal** support, so a sandboxed build can keep running in the background
- **Hardened IPC** with channel validation, and logs sanitised of personal information

## Guides

User-facing topics:

- [Installation](installation.md): GitHub Releases packages and building from source
- [Configuration](configuration.md): every option, with defaults
- [Multiple instances](multiple-instances.md): running separate work and personal profiles side by side
- [Certificate management](certificate.md): corporate CA bundles and proxy interception
- [Intune SSO](intune-sso.md): Microsoft Identity Broker integration
- [Troubleshooting](troubleshooting.md): diagnostics for common Linux desktop issues
- [Privacy & data protection](privacy.md): what personal data the app does and does not handle

## Contributing

If you want to fix a bug or add a feature:

- [Contributing guide](development/contributing.md): local setup, code standards, PR workflow
- [Architecture Decision Records](development/adr/README.md): the rationale behind significant choices
- [Release process](development/manual-release-process.md): how versions are cut

## Support

- [GitHub Issues](https://github.com/Taylor8484/outlook-for-linux/issues): bug reports and feature requests
- [GitHub Releases](https://github.com/Taylor8484/outlook-for-linux/releases): downloads and changelogs
