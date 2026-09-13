# Multiple Instances (Profiles)

Outlook for Linux supports multiple accounts two ways: an **in-app account switcher** that keeps every account in a single window, or **separate isolated instances** that each run as their own process. Either way, sessions, settings, and data stay fully isolated per account.

## Two Ways to Run Multiple Accounts

- **In-app account switcher** (single window, experimental): enable `multiAccount.enabled` and switch between accounts inside one Outlook for Linux window via the **Profiles** menu. Each account is isolated in its own session partition. The design is recorded in [ADR-020](development/adr/020-multi-account-profile-switcher); see [In-App Account Switcher](#in-app-account-switcher-experimental) below.
- **Separate isolated instances** (multiple windows/processes): launch a separate process per account, each with its own `--user-data-dir`, icon, and window class. This is documented in the rest of this page.

:::tip When to use which
Use the **in-app switcher** if you want all your accounts in one window with quick switching. Use **separate instances** if you want fully independent windows: distinct taskbar icons, separate window-manager identities, or different per-profile command-line flags.
:::

## In-App Account Switcher (Experimental)

Enable the switcher in your `config.json`:

```json
{
  "multiAccount": {
    "enabled": true
  }
}
```

With the flag on, a **Profiles** menu appears in the application menu:

- **Add profile…**: create a new account profile (name, optional custom URL, optional avatar initials and color).
- **Switch to**: jump between profiles; each runs in its own isolated `persist:` session partition, so cookies, tokens, and storage never cross tenants.
- **Manage profiles…**: rename or remove existing profiles.

On first launch after enabling the flag, your existing session (the default `persist:outlook-4-linux` partition) is migrated into a default **"My account"** profile, so you stay logged in with no re-authentication.

:::note
This feature is under active development. Switch via the **bottom-left avatar pill**, the **Profiles** menu, or, after pinning a profile in **Manage profiles…**, the `Ctrl+Alt+1…5` keyboard shortcuts (up to 5 pinned profiles, slotted in list order; active while the app is focused). The switcher is mutually exclusive with Intune SSO (`auth.intune.enabled`); see [Configuration](configuration.md). For the full design, see [ADR-020](development/adr/020-multi-account-profile-switcher).
:::

## Separate Isolated Instances (Command Line)

The rest of this page covers the separate-instances approach: one process per account, each with its own icon, window class, and data directory. It suits work and personal accounts you want as fully independent windows.

## Quick Start Examples

### Work Profile
```bash
outlook-for-linux \
  --appIcon=/path/to/work-icon.png \
  --class=outlook-work \
  --user-data-dir=/home/user/.config/outlook-profile-work
```

### Personal Profile
```bash
outlook-for-linux \
  --appIcon=/path/to/personal-icon.png \
  --class=outlook-personal \
  --user-data-dir=/home/user/.config/outlook-profile-personal
```

:::tip
Replace the `user-data-dir` with the full path where you want to store the profile data.
:::

## Command Line Options

### `--appIcon`

Set a custom tray and window icon for each profile:

```bash
--appIcon=/path/to/icon.png
```

This changes the icon used in the title bar and system tray, making it easy to distinguish between different profiles.

### `--class`

Set the internal application name used by Electron:

```bash
--class=outlook-work
```

This affects:
- Window manager identification
- Task switcher appearance
- Application grouping in the taskbar
- System-level application recognition

### `--user-data-dir`

Specify a custom directory for storing profile data:

```bash
--user-data-dir=/home/user/.config/outlook-profile-work
```

Each profile stores separately:
- Login sessions and cookies
- Configuration settings
- Cache data
- Notification preferences

## Configuration Per Profile

Each profile can have its own `config.json` file in its respective user data directory:

```
/home/user/.config/outlook-profile-work/config.json
/home/user/.config/outlook-profile-personal/config.json
```

### Example Work Profile Config
```json
{
  "app": {
    "title": "Outlook - Work"
  },
  "tray": {
    "iconType": "dark"
  },
  "disableNotificationSound": false,
  "window": {
    "closeOnCross": false
  }
}
```

### Example Personal Profile Config
```json
{
  "app": {
    "title": "Outlook - Personal"
  },
  "tray": {
    "iconType": "light"
  },
  "disableNotificationSound": true,
  "window": {
    "closeOnCross": true
  }
}
```

## Desktop Integration

### Creating Desktop Shortcuts

#### Work Profile Desktop Entry
```ini
[Desktop Entry]
Name=Outlook for Linux (Work)
Comment=Outlook for Linux - Work Profile
Exec=/path/to/outlook-for-linux --class=outlook-work --user-data-dir=%h/.config/outlook-profile-work --appIcon=%h/.local/share/icons/outlook-work.png
Icon=outlook-work
Terminal=false
Type=Application
Categories=Network;Office;Email;
StartupWMClass=outlook-work
```

#### Personal Profile Desktop Entry
```ini
[Desktop Entry]
Name=Outlook for Linux (Personal)
Comment=Outlook for Linux - Personal Profile
Exec=/path/to/outlook-for-linux --class=outlook-personal --user-data-dir=%h/.config/outlook-profile-personal --appIcon=%h/.local/share/icons/outlook-personal.png
Icon=outlook-personal
Terminal=false
Type=Application
Categories=Network;Office;Email;
StartupWMClass=outlook-personal
```

### Shell Scripts for Easy Launch

#### `outlook-work.sh`
```bash
#!/bin/bash
/path/to/outlook-for-linux \
  --class=outlook-work \
  --user-data-dir="$HOME/.config/outlook-profile-work" \
  --appIcon="$HOME/.local/share/icons/outlook-work.png" \
  "$@"
```

#### `outlook-personal.sh`
```bash
#!/bin/bash
/path/to/outlook-for-linux \
  --class=outlook-personal \
  --user-data-dir="$HOME/.config/outlook-profile-personal" \
  --appIcon="$HOME/.local/share/icons/outlook-personal.png" \
  "$@"
```

## Advanced Use Cases

### Organization-Specific Profiles

For users managing multiple organizations:

```bash
# Organization A
outlook-for-linux \
  --class=outlook-org-a \
  --user-data-dir="$HOME/.config/outlook-org-a" \
  --appTitle="Outlook - Org A"

# Organization B
outlook-for-linux \
  --class=outlook-org-b \
  --user-data-dir="$HOME/.config/outlook-org-b" \
  --appTitle="Outlook - Org B"
```

### Different Outlook URLs

Each instance can load a different Outlook entry point with `--url`, for example a work account on Microsoft 365 and a personal Outlook.com account:

```bash
# Microsoft 365 work or school account
outlook-for-linux \
  --class=outlook-work \
  --user-data-dir="$HOME/.config/outlook-profile-work" \
  --url="https://outlook.office.com/mail/"

# Personal Outlook.com account
outlook-for-linux \
  --class=outlook-personal \
  --user-data-dir="$HOME/.config/outlook-profile-personal" \
  --url="https://outlook.live.com/mail/"
```

## Best Practices

### Directory Organization
```
$HOME/.config/
├── outlook-profile-work/
│   ├── config.json
│   ├── Cache/
│   └── Partitions/
├── outlook-profile-personal/
│   ├── config.json
│   ├── Cache/
│   └── Partitions/
└── outlook-for-linux/           # Default profile
    ├── config.json
    └── ...
```

### Icon Management
- Use distinct icons for each profile (different colors, badges, etc.)
- Store icons in `$HOME/.local/share/icons/` for persistence
- Use SVG format when possible for better scaling
- Consider using the same base icon with different overlays

### Naming Conventions
- Use descriptive class names: `outlook-work`, `outlook-personal`, `outlook-client-name`
- Include purpose in directory names: `outlook-profile-work`, `outlook-profile-personal`
- Use consistent naming across desktop files, scripts, and directories

## Troubleshooting

### Profiles Not Isolated
- **Check user-data-dir**: Ensure each profile uses a different directory
- **Verify class names**: Different `--class` values help window managers distinguish instances
- **Clear conflicting cache**: Remove cache if profiles seem to share data

### Icons Not Showing
- **Check file paths**: Ensure icon files exist and are readable
- **Restart window manager**: Some changes require restarting the desktop environment
- **Icon cache**: Clear icon cache with `gtk-update-icon-cache` if needed

### Configuration Not Applied
- **Verify config location**: Ensure `config.json` is in the correct profile directory
- **JSON syntax**: Validate JSON syntax using `jq` or online validators
- **File permissions**: Ensure config files are readable by the application

## Related Documentation

- [Configuration Options](configuration.md): all available configuration options
- [Troubleshooting](troubleshooting.md): general troubleshooting guide
