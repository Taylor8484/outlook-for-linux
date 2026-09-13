# Outlook for Linux

**Unofficial Microsoft Outlook client for Linux.** Outlook for Linux wraps the
Outlook web app in [Electron](https://www.electronjs.org/) and runs it as a
standalone desktop application with Linux desktop integration. It is built on
[teams-for-linux](https://github.com/IsmaelMartinez/teams-for-linux).

> [!NOTE]
> This is an independent project, not affiliated with Microsoft. What you can do
> in the app is limited by the Outlook web app itself.

## Features

- **Sign-in helpers**: Intune single sign-on, WebAuthn / FIDO2 security keys,
  client-certificate PIN prompts, and SSO password pre-fill
- **Multiple accounts** through separate profiles
- **Desktop integration**: system notifications, download notifications, tray
  unread badge (support varies by desktop environment), global shortcuts,
  spellcheck, `mailto:` links that open an Outlook compose window, and
  AppImage auto-update
- **Custom CSS** to restyle the web app
- **Proxy and certificate** configuration for corporate networks
- **Zoom** controls

## Installation

Download a package for your distribution from
[GitHub Releases](https://github.com/Taylor8484/outlook-for-linux/releases):

| Format | Use it on |
|--------|-----------|
| `.deb` | Debian, Ubuntu and derivatives |
| `.rpm` | Fedora, RHEL, openSUSE and derivatives |
| `.AppImage` | Any distribution (supports auto-update) |
| `.tar.gz` | Any distribution (unpack and run `outlook-for-linux`) |

Packages are built for x64, arm64 and armv7l.

A snap is not published to the Snap Store yet. To use one, build it locally
with `npm run dist:linux:snap` (requires `snapcraft`).

> [!TIP]
> For AppImage files, [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher)
> gives better desktop integration.

## Run from Source

Requires Node.js (see `.nvmrc`) and npm.

```bash
git clone https://github.com/Taylor8484/outlook-for-linux.git
cd outlook-for-linux
npm ci
npm start
```

## Configuration

Settings are read from a JSON file:

- Per user: `~/.config/outlook-for-linux/config.json`
- System-wide: `/etc/outlook-for-linux/config.json`

Create the file if it does not exist. Options can also be passed on the command
line, for example
`outlook-for-linux --logConfig='{"transports":{"console":{"level":"debug"}}}'`. The available
options are defined in [`app/config/options.js`](app/config/options.js).

## Security and Sandboxing

Electron's context isolation is disabled for the main window so the app can
integrate with the Outlook web page. For stronger isolation, run the app under
system-level sandboxing such as the snap confinement, Firejail, AppArmor or
SELinux.

## Support

- Report bugs and request features in
  [GitHub Issues](https://github.com/Taylor8484/outlook-for-linux/issues)
- Report security issues privately as described in [`SECURITY.md`](SECURITY.md)
- See [`CONTRIBUTING.md`](CONTRIBUTING.md) to get involved

## Credits

- [teams-for-linux](https://github.com/IsmaelMartinez/teams-for-linux) by
  Ismael Martinez and its contributors, which this project is based on
- The original 2023 [outlook-for-linux](https://github.com/mahmoudbahaa/outlook-for-linux)
  fork by mahmoudbahaa

Read more in [`HISTORY.md`](HISTORY.md).

## License

**GPL-3.0-or-later**. See [`LICENSE.md`](LICENSE.md).
