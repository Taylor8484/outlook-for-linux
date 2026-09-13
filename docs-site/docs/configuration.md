# Configuration Options

This document details the configuration options available in Outlook for Linux. These options can be set via command-line arguments or in a `config.json` file located in the application's configuration directory.

:::note
For a complete, always-up-to-date list of every option generated directly from the code, see the [Configuration Options Reference](configuration-generated.md), or use the interactive [Configuration Explorer](configuration-explorer.mdx) to search the options and build a `config.json`. This guide adds examples, file locations, and platform notes on top of those.
:::

{/* toc */}

## Table of Contents

- [Quick Start](#quick-start)
- [Configuration Locations](#configuration-locations)
- [Configuration Options Reference](#configuration-options-reference)
  - [Application Core](#application-core)
  - [Window & UI Behavior](#window--ui-behavior)
  - [Theming & Appearance](#theming--appearance)
  - [Tray Icon](#tray-icon)
  - [Notification System](#notification-system)
  - [Downloads](#downloads)
  - [Authentication & SSO](#authentication--sso)
  - [Multi-Account Profile Switcher (Experimental)](#multi-account-profile-switcher-experimental)
  - [Network & Proxy](#network--proxy)
  - [URL Handling](#url-handling)
  - [Keyboard Shortcuts](#keyboard-shortcuts)
  - [Performance & Hardware](#performance--hardware)
  - [Wayland](#wayland)
  - [Cache & Storage](#cache--storage)
  - [Development & Debug](#development--debug)
  - [Advanced Platform Options](#advanced-platform-options)
- [Usage Examples & Guides](#usage-examples--guides)
  - [Basic Setup Examples](#basic-setup-examples)
  - [System-wide Configuration](#system-wide-configuration)
  - [Electron CLI Flags](#electron-cli-flags)
  - [Cache Management](#cache-management)
  - [Tray Icon Behavior by Desktop Environment](#tray-icon-behavior-by-desktop-environment)
  - [Global Shortcuts](#global-shortcuts)

## Quick Start

### Command Line Example
```bash
outlook-for-linux --partition nopersist
```

### Basic Config File
Create a `config.json` file with your desired settings:

```json
{
  "window": {
    "closeOnCross": true
  },
  "disableNotifications": false,
  "appearance": {
    "cssName": "compactDark"
  }
}
```

## Configuration Locations

Place your `config.json` file in the application's configuration directory:

- **User config**: `~/.config/outlook-for-linux/config.json`
- **System-wide config**: `/etc/outlook-for-linux/config.json` (see [System-wide Configuration](#system-wide-configuration))

> [!NOTE]
> [yargs](https://www.npmjs.com/package/yargs) supports multiple configuration methods—refer to their documentation if you prefer using a configuration file over command-line arguments.

## Startup Validation

At startup the app validates your `config.json` against the option schema and logs any problems as `[CONFIG]` warnings. This is **warn-only**: an invalid entry is reported and then ignored, never blocking startup or changing existing behaviour. It catches the common mistakes:

- **Unknown options** — typos or options from a different app version.
- **Wrong types** — for example a string where a number is expected.
- **Invalid `choices`** — a value outside an option's allowed set.

Nested keys of object options (such as `auth.webauthn.enabled`) are checked the same way. Warnings name only the offending key, the expected type, and any allowed values — never your configured values, which may contain URLs, tokens, or email addresses.

:::note
Each option's **Apply** mode (whether a change takes effect immediately or after a restart) is listed in the [auto-generated reference](configuration-generated.md) and the [config explorer](configuration-explorer.mdx).
:::

## Configuration Options Reference

### Renamed options

Options are moving from flat top-level names to nested namespaces, following the
convention in [ADR-025](development/adr/025-config-option-naming-convention.md).
Both spellings work: pick the nested name for new configuration, and the tables
below mark each old name as deprecated and point at its replacement. Where you
set both, the nested name wins.

The old names keep working until **2.30.0**, and using one logs a single
aggregated warning at startup naming every option to move.

:::note
During this transition the nested names are read from `config.json` only.
Command-line flags and environment variables keep using the flat name, so
`--partition nopersist` still works and `--app.partition nopersist` is silently
ignored. The examples below use whichever spelling actually applies.
:::

### Application Core

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `app.url` | `string` | `"https://outlook.office.com/mail/"` | Outlook on the web URL to load |
| `url` | `string` | `"https://outlook.office.com/mail/"` | Deprecated, use `app.url` |
| `app.title` | `string` | `"Microsoft Outlook"` | Text to be suffixed with page title |
| `appTitle` | `string` | `"Microsoft Outlook"` | Deprecated, use `app.title` |
| `app.partition` | `string` | `"persist:outlook-4-linux"` | BrowserWindow webpreferences partition |
| `partition` | `string` | `"persist:outlook-4-linux"` | Deprecated, use `app.partition` |

### Window & UI Behavior

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `window.frame` | `boolean` | `true` | Specify false to create a Frameless Window |
| `frame` | `boolean` | `true` | Deprecated, use `window.frame` |
| `window.menubar` | `string` | `"auto"` | Menu bar behaviour. Choices: `auto`, `visible`, `hidden` |
| `menubar` | `string` | `"auto"` | Deprecated, use `window.menubar` |
| `window.minimized` | `boolean` | `false` | Start the application minimized |
| `minimized` | `boolean` | `false` | Deprecated, use `window.minimized` |
| `window.minimizeOnClose` | `boolean` | `false` | Minimize the window when clicking the close (X) cross instead of hiding it to the tray (ignored when `window.closeOnCross` is true) |
| `minimizeOnClose` | `boolean` | `false` | Deprecated, use `window.minimizeOnClose` |
| `window.closeOnCross` | `boolean` | `false` | Close the app when clicking the close (X) cross |
| `closeAppOnCross` | `boolean` | `false` | Deprecated, use `window.closeOnCross` |
| `window.alwaysOnTop` | `boolean` | `true` | Keep the pop-out window always on top of other windows |
| `alwaysOnTop` | `boolean` | `true` | Deprecated, use `window.alwaysOnTop` |
| `window.class` | `string` | `null` | Custom value for the WM_CLASS property |
| `class` | `string` | `null` | Deprecated, use `window.class` |

### Theming & Appearance

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appearance.cssName` | `string` | `""` | Custom CSS name. Options: "compactDark", "compactLight", "tweaks", "condensedDark", "condensedLight" |
| `customCSSName` | `string` | `""` | Deprecated, use `appearance.cssName` |
| `appearance.cssLocation` | `string` | `""` | Custom CSS styles file location |
| `customCSSLocation` | `string` | `""` | Deprecated, use `appearance.cssLocation` |

### Tray Icon

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tray.enabled` | `boolean` | `true` | Enable tray icon |
| `trayIconEnabled` | `boolean` | `true` | Deprecated, use `tray.enabled` |
| `tray.icon` | `string` | `""` | Custom app icon (PNG) for the tray, the window icon on Windows and Linux, and the dock on macOS. Also settable from the App Icon menu |
| `appIcon` | `string` | `""` | Deprecated, use `tray.icon` |
| `tray.iconType` | `string` | `"default"` | Type of tray icon. Choices: `default`, `light`, `dark` |
| `appIconType` | `string` | `"default"` | Deprecated, use `tray.iconType` |
| `tray.useMutationTitleLogic` | `boolean` | `true` | Use MutationObserver to update the unread counter from the page title |
| `useMutationTitleLogic` | `boolean` | `true` | Deprecated, use `tray.useMutationTitleLogic` |
| `disableBadgeCount` | `boolean` | `false` | Disable the badge counter on the taskbar/dock icon |

### Notification System

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `disableNotifications` | `boolean` | `false` | Disable all notifications |
| `disableNotificationSound` | `boolean` | `false` | Disable the notification sound |
| `disableNotificationWindowFlash` | `boolean` | `false` | Disable window flashing when there is a notification |
| `notificationMethod` | `string` | `"web"` | Notification method. Choices: `web`, `electron`, `custom` |
| `customNotification` | `object` | `{ toastDuration: 5000 }` | Configuration for custom in-app toast notifications (used when `notificationMethod` is `custom`) |
| `defaultNotificationUrgency` | `string` | `"normal"` | Default urgency for new notifications. Choices: `low`, `normal`, `critical` |
| `notifications.timeoutType` | `string` | `"default"` | How long notifications stay in the system notification center (Linux/Windows only). Choices: `default` (auto-clear per system policy) or `never` (persist until the user dismisses, useful on GNOME and other desktops that auto-remove notifications). Mirrors Electron's Notification `timeoutType`. May not be honoured by every notification daemon. |
| `notifications.electron.clickAction` | `string` | `"show"` | What clicking a notification does to the main window (`notificationMethod: "electron"` only). Choices: `show` (reveal the window, current behaviour), `restore` (also un-minimise and focus, which helps on GNOME where a plain show does not raise the window) or `none` (do nothing). On Linux whether focus is honoured depends on the window manager. |

### Downloads

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `download.enabled` | `boolean` | `false` | Master switch for the download feedback feature. Opt-in while in early development; set to `true` to enable the manager. The sub-flags only take effect when `enabled` is `true`. |
| `download.notifyOnDownloadComplete` | `boolean` | `true` | Show a system notification when a file download (for example an email attachment) finishes (click opens the containing folder). Set to `false` to suppress. |
| `download.showProgressBar` | `boolean` | `true` | Drive in-flight feedback through `BrowserWindow.setProgressBar` (macOS / Windows; effectively no-op on Linux), a `com.canonical.Unity.LauncherEntry` D-Bus broadcast that Ubuntu Dock and Dash-to-Dock subscribe to (GNOME / Ubuntu users), and an `org.kde.JobViewServer` per-download view rendered in KDE Plasma's notification widget. The window-title prefix is a separate sub-flag (`showTitlePrefix`). |
| `download.showTitlePrefix` | `boolean` | `true` | Also prefix the main window title with `[34%]` (or `[downloading]`) while a download is in flight. Every WM/DE renders the window title in its taskbar tooltip / Alt-Tab, so this is a portable fallback for environments where the other channels are unavailable. Set to `false` on KDE / Ubuntu where the JobView / LauncherEntry already shows progress and the title churn is redundant. |

### Authentication & SSO

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `authServerWhitelist` | `string` | `"*"` | Set auth-server-whitelist value |
| `customCACertsFingerprints` | `array` | `[]` | Array of custom CA Certs Fingerprints to allow SSL unrecognized signer or self signed certificate |

#### Basic Authentication

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ssoBasicAuthUser` | `string` | `""` | User to use for SSO basic auth |
| `ssoBasicAuthPasswordCommand` | `string` | `""` | Command to execute to retrieve password for SSO basic auth |

#### Web Login Password Pre-fill

If your organisation expires the Outlook session frequently (short-lived tokens, sign-in-frequency policies), you land on the Microsoft/federated **web** login page most launches. Microsoft remembers your account (email) but never the password, so you retype it every time.

Set `auth.webLogin.passwordCommand` to a command that prints your password (first line of stdout); the app pre-fills it into the password field on the login page. It runs in a shell, so use your own password manager — the app itself stores no secret. Set `auth.webLogin.user` to also pre-fill the email/username field when it is blank (useful when the account isn't remembered and you land on the "Enter your email" step).

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `auth.webLogin.user` | `string` | `""` | Email/username pre-filled into the account field when it is empty. Empty disables it. |
| `auth.webLogin.passwordCommand` | `string` | `""` | Command whose first stdout line is pre-filled into the web login password field. Empty disables the feature. |
| `auth.webLogin.extraHosts` | `array` | `[]` | Extra host suffixes to treat as login pages, in addition to the built-in Microsoft hosts (`login.microsoftonline.com`, `login.microsoft.com`, `login.live.com`). Add your federated IdP host if sign-in happens off the Microsoft hosts. |
| `auth.webLogin.autoSubmit` | `boolean` | `false` | Automatically advance each step: click Next after the email and Sign in after the password. Off by default so you review and submit yourself. |
| `auth.webLogin.verifyMethod` | `string` | `""` | On the "Verify your identity" (MFA) page, click the option whose label starts with this text, e.g. `Text` for SMS. Empty disables it. Best-effort text match. |

```json
{
  "auth": {
    "webLogin": {
      "user": "you@example.org",
      "passwordCommand": "pass show work/outlook",
      "autoSubmit": true,
      "verifyMethod": "Text"
    }
  }
}
```

With the example above, the app fills the email and clicks Next, fills the password and clicks Sign in, then on the MFA "Verify your identity" page clicks the **Text** (SMS) option — leaving you only to enter the texted code. Drop `auth.webLogin.autoSubmit`/`auth.webLogin.verifyMethod` if you prefer to click through the steps yourself.

This is separate from **Basic Authentication** above: `ssoBasicAuthPasswordCommand` feeds the native HTTP Basic/NTLM dialog, whereas `auth.webLogin.passwordCommand` fills the browser login form. The password is passed only to the login page (never logged or persisted) and only on the configured login hosts. If your sign-in page is a company-branded `login.microsoftonline.com` page (a logo/background on the standard Microsoft page), the defaults already cover it; only add `auth.webLogin.extraHosts` if the password page is served from a different hostname.

#### Intune SSO

Intune SSO uses a nested `auth.intune` configuration. See the [Intune SSO guide](intune-sso.md) for setup details.

```json
{
  "auth": {
    "intune": {
      "enabled": false,
      "user": ""
    }
  }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `auth.intune.enabled` | `boolean` | `false` | Enable Single-Sign-On using Microsoft Intune |
| `auth.intune.user` | `string` | `""` | User (e-mail) to use for Intune SSO |

**Removed Options (migrate before upgrading):**

| Old Option | New Option | Notes |
|------------|------------|-------|
| `ssoInTuneEnabled` | `auth.intune.enabled` | Renamed + moved |
| `ssoInTuneAuthUser` | `auth.intune.user` | Renamed + moved |

#### Third-Party SSO and CSP

Report-only Content Security Policy headers are automatically stripped for domains outside the Microsoft web app itself (such as third-party identity providers). This is necessary because Electron's `contextIsolation: false` setting (required for DOM access to the web app) erroneously enforces report-only CSP as blocking, which breaks third-party SSO providers like Symantec VIP. No configuration is needed.

#### WebAuthn / FIDO2 Security Keys

Hardware security key authentication (YubiKey, SoloKeys, etc.) for Microsoft Entra ID login. On Linux, Electron's Chromium lacks native WebAuthn hardware support, so this module intercepts `navigator.credentials` calls and routes them to `fido2-tools`. On macOS and Windows, Electron handles WebAuthn natively and this feature is not needed.

Requires the `fido2-tools` system package: `sudo apt install fido2-tools` (Debian/Ubuntu) or `sudo dnf install fido2-tools` (Fedora) or `sudo pacman -S libfido2` (Arch). The deb and rpm packages list it as a recommended dependency, so it is installed automatically unless weak dependencies are disabled.

```json
{
  "auth": {
    "webauthn": {
      "enabled": true
    }
  }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `auth.webauthn.enabled` | `boolean` | `false` | Enable FIDO2 hardware security key support for WebAuthn authentication on Linux |
| `auth.webauthn.debug` | `boolean` | `false` | Enable verbose WebAuthn diagnostic logging (useful for beta testers troubleshooting key registration) |
| `auth.webauthn.extraOrigins` | `array` | `[]` | Extra sign-in origins allowed to use hardware keys, in addition to the built-in Microsoft login origins |

Interception is limited to the Microsoft login origins (`https://login.microsoftonline.com`, `https://login.microsoft.com`, `https://login.live.com`). If your tenant is federated and the key prompt is served by your own identity provider, the ceremony is blocked and the log shows `[WEBAUTHN] Blocked request { reason: 'origin-not-allowed' }`. Add that origin to `auth.webauthn.extraOrigins` and restart:

```json
{
  "auth": {
    "webauthn": {
      "enabled": true,
      "extraOrigins": ["https://sso.example.com"]
    }
  }
}
```

Entries are exact `https` origins: scheme, host and, where the identity provider is not on 443, its port (`https://sso.example.com:8443`). Wildcards, paths and `http` entries are ignored, so a subdomain of a listed origin is not covered and has to be listed in its own right.

#### Certificates

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `clientCertPath` | `string` | `""` | Custom Client Certs for corporate authentication (certificate must be in pkcs12 format) |
| `clientCertPassword` | `string` | `""` | Custom Client Certs password for corporate authentication |

See the [Certificate guide](certificate.md) for custom CA certificates.

#### Smartcard / Client Certificate PIN (Linux)

When a client certificate lives on a smartcard or other PKCS#11 token, NSS needs the token PIN before it can present the certificate. On Linux, Chromium delegates that PIN prompt to the application, so without a handler the certificate is never presented and sign-in fails silently. Enabling this shows a PIN dialog when a token needs unlocking. The feature is Linux only and off by default; macOS and Windows provide native PIN prompts. Changing it requires a restart.

```json
{
  "auth": {
    "clientCertificate": {
      "pinDialog": {
        "enabled": true
      }
    }
  }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `auth.clientCertificate.pinDialog.enabled` | `boolean` | `false` | Show a PIN dialog for smartcard / PKCS#11 client certificates on Linux. No effect on macOS or Windows. |

Configuring the PKCS#11 module itself is your responsibility. A typical OpenSC setup registers the card with the NSS database Chromium uses (paths vary by distro):

```bash
sudo apt install opensc                       # or distro equivalent
modutil -dbdir sql:$HOME/.pki/nssdb -add opensc -libfile /usr/lib/x86_64-linux-gnu/opensc-pkcs11.so
```

The token name and requesting hostname appear in the dialog but are never logged, and the entered PIN is never logged or written to disk.

#### Cookies

Some localStorage tokens get encrypted by a Session cookie 'msal.cache.encryption'. Electron drops this cookie on process exits, so the encrypted tokens can't be decrypted anymore. This forces a fresh login on every start and clears locally stored web app settings. This option sets an expiration date for the cookie to promote it from a session cookie, so it survives restarts.

This is on by default. Microsoft mints the cookie as session-scoped deliberately, so keeping it means the token-decryption key stays on disk for longer than Microsoft intended. If you prefer that tradeoff the other way around, set `enabled` to `false` and sign in again after each restart.

```json
{
  "auth": {
    "keepMsalCacheEncryptionCookie": {
      "enabled": false,
      "days": 400
    }
  }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `auth.keepMsalCacheEncryptionCookie.enabled` | `boolean` | `true` | Sets an expiration date for the 'msal.cache.encryption' cookie to keep it after restarts. |
| `auth.keepMsalCacheEncryptionCookie.days` | `number` | `400` | Sets the amount of days the 'msal.cache.encryption' cookie should be kept for. Between 1 and 400. |

### Multi-Account Profile Switcher (Experimental)

> **Status:** Phase 1 shipped. With the flag enabled you get a bottom-left **account switcher pill** (dropdown with every profile + Add/Manage), a **Profiles** menu (Add / Switch / Manage / Remove profiles), `Ctrl+Alt+1…5` shortcuts for pinned profiles (pin via **Manage profiles…**, up to 5; Linux/Windows), first-run migration of your existing session into a default "My account" profile, and per-profile session isolation — each profile runs against its own persistent partition so cookies, tokens, and storage never cross tenants. See [ADR-020](development/adr/020-multi-account-profile-switcher) for the full design and later phases.

Opt-in configuration for the single-window multi-tenant account switcher:

```json
{
  "multiAccount": {
    "enabled": false
  }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `multiAccount.enabled` | `boolean` | `false` | Opt-in flag for the multi-account profile switcher. See [ADR-020](development/adr/020-multi-account-profile-switcher) for the full design. |

**Mutual exclusion with Intune SSO:** If `multiAccount.enabled` is `true` at startup and `auth.intune.enabled` is also `true`, the app logs a warning, appends it to `config.warnings`, and disables multi-account for the session. The Linux D-Bus Microsoft Identity Broker has undocumented behavior around concurrent enrollments for different UPNs on one machine, so Phase 1 treats Intune as single-profile-only.

### Network & Proxy

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `proxyServer` | `string` | `null` | Proxy Server with format address:port |
| `network.webRTCIPHandlingPolicy` | `string` | `null` | Controls which network interfaces WebRTC uses for ICE candidate gathering. Choices: `default`, `default_public_and_private_interfaces`, `default_public_interface_only`, `disable_non_proxied_udp` |
| `network.disableQuic` | `boolean` | `true` | Append Chromium's `--disable-quic` switch at startup. Defaults to `true` to work around concurrent SharePoint/OneDrive downloads aborting with `ERR_QUIC_PROTOCOL_ERROR` on the shared QUIC session (inherited from teams-for-linux issue #2518). Set to `false` to re-enable QUIC if a future Chromium release fixes the underlying transport bug. |

*   `default` - Exposes user's public and local IPs. This is the default behavior. When this policy is used, WebRTC has the right to enumerate all interfaces and bind them to discover public interfaces.

*   `default_public_interface_only` - Exposes user's public IP, but does not expose user's local IP. When this policy is used, WebRTC should only use the default route used by http. This doesn't expose any local addresses.

*   `default_public_and_private_interfaces` - Exposes user's public and local IPs. When this policy is used, WebRTC should only use the default route used by http. This also exposes the associated default private address. Default route is the route chosen by the OS on a multi-homed endpoint.

*   `disable_non_proxied_udp` - Does not expose public or local IPs. When this policy is used, WebRTC should only use TCP to contact peers or servers unless the proxy server supports UDP.

```json
"network": {
	"webRTCIPHandlingPolicy": "default_public_interface_only"
}
```

### URL Handling

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `urlHandling.defaultHandler` | `string` | `""` | Default application to open HTTP URLs |
| `defaultURLHandler` | `string` | `""` | Deprecated, use `urlHandling.defaultHandler` |

### Keyboard Shortcuts

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `shortcuts.global` | `array` | `[]` | Global keyboard shortcuts that work system-wide (opt-in, disabled by default). See [Global Shortcuts](#global-shortcuts) |
| `shortcuts.disableWhileFocused` | `array` | `[]` | Array of global shortcuts to disable while app is in focus |
| `globalShortcuts` | `array` | `[]` | Deprecated, use `shortcuts.global` |
| `disableGlobalShortcuts` | `array` | `[]` | Deprecated, use `shortcuts.disableWhileFocused` |

### Performance & Hardware

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `performance.disableGpu` | `boolean` | `false` | Disable GPU and hardware acceleration |
| `disableGpu` | `boolean` | `false` | Deprecated, use `performance.disableGpu` |
| `performance.electronCLIFlags` | `array` | `[]` | Electron CLI flags |
| `electronCLIFlags` | `array` | `[]` | Deprecated, use `performance.electronCLIFlags` |

### Wayland

Wayland display server settings are organized under the `wayland` configuration object:

```json
{
  "wayland": {
    "xwaylandOptimizations": false
  }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wayland.xwaylandOptimizations` | `boolean` | `false` | Enable XWayland-specific optimizations: keeps GPU acceleration enabled under XWayland instead of auto-disabling it |

### Cache & Storage

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `cacheManagement` | `object` | `{ enabled: false, maxCacheSizeMB: 600, cacheCheckIntervalMs: 3600000 }` | Cache management configuration |
| `storage.clearData` | `boolean` \| `object` | `null` | Clear storage data on start. `true` clears everything; an object is passed through as Electron [`ClearStorageDataOptions`](https://www.electronjs.org/docs/latest/api/session#sesclearstoragedataoptions), for example `{"storages": ["cookies"]}` |
| `clearStorageData` | `boolean` | `null` | Deprecated, use `storage.clearData` |

> [!NOTE]
> See [Cache Management](#cache-management) for detailed configuration and usage examples.

### Development & Debug

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `development.webDebug` | `boolean` | `false` | Enable debug at start |
| `webDebug` | `boolean` | `false` | Deprecated, use `development.webDebug` |
| `logConfig` | `object` | `{ transports: { console: { level: "info" }, file: { level: false } } }` | Electron-log configuration |
| `development.watchConfigFile` | `boolean` | `false` | Watch for changes in config file and reload the app |
| `watchConfigFile` | `boolean` | `false` | Deprecated, use `development.watchConfigFile` |

### Advanced Platform Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `platform.chromeUserAgent` | `string` | `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version> Safari/537.36` | Google Chrome User Agent |
| `chromeUserAgent` | `string` | `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/<version> Safari/537.36` | Deprecated, use `platform.chromeUserAgent` |
| `platform.emulateWindowsChromium` | `boolean` | `false` | Use windows platform information in chromium (helpful if MFA app doesn't support Linux) |
| `emulateWinChromiumPlatform` | `boolean` | `false` | Deprecated, use `platform.emulateWindowsChromium` |
| `platform.spellCheckerLanguages` | `array` | `[]` | Array of languages to use with Electron's spell checker |
| `spellCheckerLanguages` | `array` | `[]` | Deprecated, use `platform.spellCheckerLanguages` |

:::note Wayland GPU Handling
When running under Wayland, GPU acceleration is **automatically disabled by default** to prevent blank window issues. To enable GPU acceleration on Wayland, you can explicitly override this behavior using either:

**Configuration file** (`config.json`):
```json
{
  "performance": {
    "disableGpu": false
  }
}
```

**Command-line argument**:
```bash
outlook-for-linux --disableGpu=false
```

If you don't set this option at all (via config file or CLI), GPU will be disabled automatically on Wayland. This smart default ensures the app works out of the box while allowing power users to optimize performance.
:::

:::note XWayland Optimizations
When running under XWayland (Wayland session with `--ozone-platform=x11`), the app treats it the same as native Wayland by default. If you want GPU acceleration under XWayland, you can enable XWayland-specific optimizations:

```json
{
  "wayland": {
    "xwaylandOptimizations": true
  }
}
```

When enabled, this flag:
- Keeps GPU acceleration enabled under XWayland (instead of auto-disabling)
- Skips the `--use-fake-ui-for-media-stream` Chromium flag under XWayland

Only enable it if you are experiencing rendering or performance problems under XWayland.
:::

## Usage Examples & Guides

### Basic Setup Examples

#### Minimal Configuration
```json
{
  "window": {
    "closeOnCross": true
  }
}
```

#### Dark Theme with Notifications Disabled
```json
{
  "appearance": {
    "cssName": "compactDark"
  },
  "disableNotifications": true
}
```

#### Enterprise Setup
```json
{
  "auth": {
    "intune": {
      "enabled": true,
      "user": "user@company.com"
    }
  },
  "clientCertPath": "/path/to/cert.p12",
  "clientCertPassword": "password",
  "proxyServer": "proxy.company.com:8080"
}
```

#### Custom Notifications Setup
```json
{
  "notificationMethod": "custom",
  "customNotification": {
    "toastDuration": 5000
  }
}
```

> [!NOTE]
> The `custom` notification method displays in-app toast notifications instead of OS-level notifications. This is useful when:
> - Your notification daemon is unreliable or not running
> - You experience application freezes with web/electron notifications
> - OS notifications don't work consistently on your desktop environment
>
> **Configuration options:**
> - `toastDuration`: Time in milliseconds before toast auto-dismisses (default: 5000ms)
>
> Toasts appear in the bottom-right corner and clicking them focuses the main Outlook for Linux window.

### System-wide Configuration

Outlook for Linux supports system-wide configuration files for enterprise and multi-user environments.

#### Configuration Precedence
1. **System-wide config**: `/etc/outlook-for-linux/config.json`
2. **User config**: User's config directory (e.g., `~/.config/outlook-for-linux/config.json`)
3. **Default values**: Built-in application defaults

> [!NOTE]
> User configurations take precedence over system-wide configurations. This allows administrators to set organization-wide defaults while still allowing individual users to customize their settings.

#### Example System-wide Config

Create `/etc/outlook-for-linux/config.json` to set organization-wide defaults:

```json
{
  "window": {
    "closeOnCross": false
  },
  "disableNotifications": false,
  "appearance": {
    "cssName": "compactDark"
  },
  "auth": {
    "intune": {
      "enabled": true
    }
  },
  "proxyServer": "proxy.company.com:8080"
}
```

### Electron CLI Flags

The configuration file can include Electron CLI flags that will be added when the application starts.

```json
{
  "performance": {
    "electronCLIFlags": [
      "disable-software-rasterizer"
    ]
  }
}
```

> [!NOTE]
> For options that require a value, provide them as an array where the first element is the flag and the second is its value. If no value is needed, you can use a simple string.

> [!WARNING]
> The `ozone-platform` flag **cannot** be set via `electronCLIFlags` because it must be applied before the Electron process starts (before any JavaScript executes). The current default is `--ozone-platform=x11` on all Linux packaging formats. To force a different backend, pass `--ozone-platform=wayland` as a command-line argument when launching the app, or edit the `Exec=` line in your `.desktop` file. See [Troubleshooting: Wayland / Display Issues](troubleshooting.md#wayland--display-issues) for details.

#### Custom Feature Flags (enable-features / disable-features)

Outlook for Linux automatically sets Chromium feature flags for optimal functionality. These defaults are applied only if you don't provide your own flags.

**Default Settings:**
- `--disable-features=HardwareMediaKeyHandling` - Prevents the keyboard media keys from being captured by the web app
- `--enable-features=WebRTCPipeWireCapturer` - Enables PipeWire capture (Wayland only)

**Using Custom Feature Flags:**

If you need custom feature flags, provide them when launching the app. The application respects your flags and will not override them.

```bash
# Example: Adding your own features on Wayland
outlook-for-linux --enable-features=MyCustomFeature,WebRTCPipeWireCapturer

# Example: Disabling features
outlook-for-linux --disable-features=HardwareMediaKeyHandling,UnwantedFeature
```

> [!WARNING]
> When providing custom flags, **you should include the default features** listed above:
> - **Always include:** `HardwareMediaKeyHandling` in `--disable-features`
> - **On Wayland:** Also include `WebRTCPipeWireCapturer` in `--enable-features`
>
> Missing default features will trigger a warning but won't prevent the app from starting.

**Complete example with custom and default features:**

```bash
# Wayland users with custom needs
outlook-for-linux --enable-features=MyFeature,WebRTCPipeWireCapturer \
                  --disable-features=HardwareMediaKeyHandling,OtherFeature
```

### Cache Management

> [!NOTE]
> The Cache Manager is **disabled by default**. It was designed to prevent daily logout issues caused by cache overflow, but in practice it caused more problems than it solved for most users. You can enable it if you experience cache-related authentication issues.

The cache management feature automatically cleans cache files when they grow too large and cause token corruption:

```json
{
  "cacheManagement": {
    "enabled": false,
    "maxCacheSizeMB": 600,
    "cacheCheckIntervalMs": 3600000
  }
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `false` | Enable/disable automatic cache management |
| `maxCacheSizeMB` | `number` | `600` | Maximum cache size in MB before cleanup |
| `cacheCheckIntervalMs` | `number` | `3600000` | How often to check cache size in milliseconds (1 hour) |

#### What Gets Cleaned vs Preserved

<details>
<summary>Click to expand cleanup details</summary>

**Cleaned:**
- Cache directories (main Cache, GPUCache, Code Cache)
- Partition-specific cached data for your configured partition (e.g. `Partitions/outlook-4-linux/{Cache,GPUCache,Code Cache}`)
- Temporary WAL/journal files that are known to cause token corruption

**Preserved:**
- IndexedDB and WebStorage for the Outlook partition (these contain authentication tokens and session state)
- Authentication tokens and login credentials
- User preferences and settings
- Other essential persistent storage

</details>

#### Manual Cache Cleanup

Enable debug logging to monitor cache activities:

```bash
outlook-for-linux --logConfig='{"level":"debug"}'
```

**Option 1: Safe cleanup (won't sign you out)**

This mirrors what the app's automatic cleaner does:

```bash
# Stop Outlook for Linux first
pkill -f "outlook-for-linux"

# Remove top-level caches
rm -rf ~/.config/outlook-for-linux/Cache/*
rm -rf ~/.config/outlook-for-linux/GPUCache/*
rm -rf ~/.config/outlook-for-linux/"Code Cache"/*

# Remove partition-specific caches (default partition name is outlook-4-linux)
rm -rf ~/.config/outlook-for-linux/Partitions/outlook-4-linux/Cache/*
rm -rf ~/.config/outlook-for-linux/Partitions/outlook-4-linux/GPUCache/*
rm -rf ~/.config/outlook-for-linux/Partitions/outlook-4-linux/"Code Cache"/*

# Remove problematic temporary files
rm -f ~/.config/outlook-for-linux/DIPS-wal
rm -f ~/.config/outlook-for-linux/SharedStorage-wal
rm -f ~/.config/outlook-for-linux/Cookies-journal
```

**Option 2: Full reset (will sign you out)**

To clear all stored data for the web app (cookies, local storage, IndexedDB), start the app once with `storage.clearData` enabled, then remove the option again:

```json
{
  "storage": {
    "clearData": true
  }
}
```

> [!WARNING]
> You'll be logged out and will need to sign in again. Use this only if you suspect corrupted site data or repeated auth failures.

### Tray Icon Behavior by Desktop Environment

The tray icon functionality varies depending on your Linux desktop environment:

#### Visual Badge Support
- **Unity (Ubuntu 12.04-18.04)**: ✅ Shows visual launcher badges with unread count
- **KDE Plasma**: ✅ Shows taskbar badge overlays with unread count
- **GNOME**: ✅ Limited support via extensions
- **Cinnamon/MATE**: ❌ No visual badges - **unread count shown in tooltip only**
- **XFCE**: ❌ Limited badge support
- **macOS**: ✅ Dock badges (full support)
- **Windows**: ✅ Taskbar overlay badges (full support)

#### Cinnamon Users

If you're using Linux Mint Cinnamon or other Cinnamon-based distributions:

- **Hover over the tray icon** to see unread count in tooltip, for example "Microsoft Outlook (5)" (the tooltip uses `app.title`)
- **Click the tray icon** to show/focus the Outlook window
- **Window flashing** indicates new notifications
- **Right-click** for context menu options

### Global Shortcuts

:::note Opt-In Feature
Global shortcuts are **disabled by default**. Add shortcuts to your config to enable this feature.
:::

System-wide keyboard shortcuts that work even when Outlook for Linux is not focused. When triggered, the app window is brought forward and the key combination is forwarded to Outlook on the web, which handles it with its built-in keyboard shortcuts.

#### Configuration Example

```json
{
  "shortcuts": {
    "global": [
      "Control+Shift+M"
    ]
  }
}
```

Choose combinations that match the keyboard shortcut set selected in Outlook on the web (**Settings → General → Accessibility → Keyboard shortcuts**). See Microsoft's keyboard shortcut documentation for Outlook on the web for the full list.

#### Important Notes

- **QWERTY keyboard layout only**: Shortcuts are based on physical QWERTY key positions
- **macOS limitation**: Non-QWERTY layouts (Dvorak, AZERTY, Colemak, etc.) are not supported due to [Electron bug #19747](https://github.com/electron/electron/issues/19747)
- **Linux/Windows**: Works better but may have issues with layout changes during runtime

See [Electron Accelerators](https://www.electronjs.org/docs/latest/api/accelerator) for available key combinations.
