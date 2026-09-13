# Installation Guide

Outlook for Linux is distributed as packages on GitHub Releases, and can also be built from source.

:::info About Outlook for Linux
**Unofficial Microsoft Outlook client for Linux**: a desktop app that wraps Outlook on the web with Linux integration including system notifications, a tray icon with unread badge, and multiple account profiles. Not affiliated with Microsoft.
:::

## Download from GitHub Releases

1. Go to [GitHub Releases](https://github.com/Taylor8484/outlook-for-linux/releases)
2. Download the package for your system. Builds are published for x64, arm64, and armv7l:
   - **deb**: Debian, Ubuntu, and derivatives
   - **rpm**: Fedora, RHEL, openSUSE, and derivatives
   - **AppImage**: runs on most distributions without installation
   - **tar.gz**: portable archive

### Debian/Ubuntu (.deb)

```bash
sudo apt install ./outlook-for-linux_*.deb
```

If you install with `dpkg -i` instead, run `sudo apt-get install -f` afterwards to pull in any missing dependencies.

### Fedora/RHEL (.rpm)

```bash
# Fedora / RHEL 8+
sudo dnf install ./outlook-for-linux-*.rpm

# Older systems
sudo rpm -i outlook-for-linux-*.rpm
```

### AppImage

```bash
# Make executable
chmod +x outlook-for-linux-*.AppImage

# Run directly
./outlook-for-linux-*.AppImage
```

:::tip AppImage updates and integration
The AppImage build includes an auto-updater that checks GitHub Releases for newer versions and asks before installing one. The deb, rpm, and tar.gz packages do not update themselves; download the new release when one is published.

For desktop menu entries, use [AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) or [Gear Lever](https://github.com/mijorus/gearlever).
:::

### Portable Installation (tar.gz)

```bash
# Extract
tar -xzf outlook-for-linux-*.tar.gz

# Run
cd outlook-for-linux-*/
./outlook-for-linux
```

## Build from Source

Building from source requires Git and a current Node.js LTS release with npm.

```bash
git clone https://github.com/Taylor8484/outlook-for-linux.git
cd outlook-for-linux
git checkout develop-outlook
npm ci

# Run the app in development mode
npm start

# Or build Linux packages (written to dist/)
npm run dist:linux
```

To build a single format, use `npm run dist:linux:deb`, `dist:linux:rpm`, `dist:linux:appimage`, or `dist:linux:targz`. See the [Contributing guide](development/contributing.md) for the full development workflow.

:::note
When run from source with `npm start`, Electron stores configuration in `~/.config/Electron/` rather than `~/.config/outlook-for-linux/`.
:::

## First Launch

### Quick Start

1. **Launch** the application:
   ```bash
   outlook-for-linux
   ```

2. **Sign in** with your Microsoft work, school, or personal account. The app opens `https://outlook.office.com/mail/` by default.

3. **Configure** if needed by creating `~/.config/outlook-for-linux/config.json`

### Initial Configuration

For basic usage, no configuration is required. Outlook for Linux works out of the box.

For advanced features, create a configuration file:

```bash
mkdir -p ~/.config/outlook-for-linux/
```

Example basic configuration:
```json
{
  "window": {
    "closeOnCross": false
  },
  "tray": {
    "enabled": true
  }
}
```

See the [Configuration Guide](configuration.md) for all available options.

### Open Email Links in Outlook for Linux

The deb and rpm packages, and AppImages installed with a desktop entry, register the app for `mailto:` links, but it never makes itself the default handler. To have clicked email links open an Outlook compose window with the recipient, subject and body filled in:

```bash
xdg-mime default outlook-for-linux.desktop x-scheme-handler/mailto
```

Check the current handler with `xdg-mime query default x-scheme-handler/mailto`. The compose window shares the main window's session, so you stay signed in.

## Command Line Options

### Basic Usage

```bash
# Standard launch
outlook-for-linux

# Use a custom profile directory
outlook-for-linux --user-data-dir=/path/to/custom/profile
```

### Multiple Instances

```bash
# Work profile
outlook-for-linux --user-data-dir=$HOME/.config/outlook-work --class=outlook-work

# Personal profile
outlook-for-linux --user-data-dir=$HOME/.config/outlook-personal --class=outlook-personal
```

See [Multiple Instances](multiple-instances.md) for detailed setup.

### Debug Mode

```bash
# Enable debug logging
outlook-for-linux --logConfig='{"level":"debug"}'

# Show Electron logging on the console
ELECTRON_ENABLE_LOGGING=true outlook-for-linux
```

## Troubleshooting Installation

### Package Dependencies

```bash
# Ubuntu/Debian - fix missing dependencies
sudo apt-get install -f

# Fedora - install a missing package
sudo dnf install missing-package-name
```

The deb and rpm packages recommend `fido2-tools`, which is only needed if you sign in with a hardware security key.

### Network/Proxy Issues

```bash
# For corporate environments with proxies
export https_proxy=http://proxy.company.com:8080
```

The app also has its own `proxyServer` option; see [Certificate Management](certificate.md) for proxies that intercept TLS.

## Next Steps

After installation:

1. **[Configuration](configuration.md)**: customise Outlook for Linux settings
2. **[Multiple Instances](multiple-instances.md)**: set up work and personal profiles
3. **[Troubleshooting](troubleshooting.md)**: common issues and solutions
4. **[Uninstall Guide](uninstall.md)**: remove Outlook for Linux from your system

## Support

- **Documentation**: [Full documentation](index.md)
- **Issues**: [GitHub Issues](https://github.com/Taylor8484/outlook-for-linux/issues)
- **Releases**: [GitHub Releases](https://github.com/Taylor8484/outlook-for-linux/releases)

## Related Documentation

- [Configuration Options](configuration.md): complete configuration reference
- [Multiple Instances](multiple-instances.md): running multiple profiles
- [Troubleshooting](troubleshooting.md): common issues and solutions
