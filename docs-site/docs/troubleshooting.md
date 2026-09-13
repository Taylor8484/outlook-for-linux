# Troubleshooting Guide

This guide provides solutions to common problems encountered with Outlook for Linux, organized by category for quick reference.

:::tip
For configuration options, see [Configuration](configuration.md). For development information, see the [IPC API documentation](development/ipc-api.md).
:::

Outlook for Linux is based on teams-for-linux, so some of the fixes below were first reported and diagnosed there. If you hit a problem not listed here, please [open an issue](https://github.com/Taylor8484/outlook-for-linux/issues).

## Quick Reference

- **Cache Issues**: Clear cache directories (see [Configuration](configuration.md) for the cache management options)
- **Login Problems**: Clear stored data and cache
- **Notification Issues**: Check `notificationMethod` in config
- **Rendering Issues**: Check `performance.disableGpu` and the `--ozone-platform` flag
- **Installation**: Use clean install and clear previous data

## Performance Tuning

When the app feels slow or heavy, a handful of configuration options are the first-line knobs to check. `performance.disableGpu` turns off GPU compositing and hardware acceleration, which helps on broken graphics drivers and hurts otherwise. `cacheManagement.maxCacheSizeMB` (default 600) and `cacheManagement.cacheCheckIntervalMs` (default one hour) govern automatic cache cleanup, while `performance.electronCLIFlags` passes arbitrary Chromium flags for tuning memory, GPU, or rendering behaviour. See [Configuration](configuration.md) for details on each option.

---

## Common Issues and Solutions

### Installation and Updates

#### Issue: Application fails to launch after update

**Description:** The application does not start or crashes immediately after an update.

**Potential Causes:**
*   Corrupted installation files.
*   Conflicting cached data from previous versions.
*   Incomplete update process.

**Solutions/Workarounds:**

1.  **Clear Application Cache:**
    *   Navigate to `~/.config/outlook-for-linux/`.
    *   Delete the `Cache` and `Code Cache` directories.
    *   Restart the application.

2.  **Reinstall the Application:**
    *   Completely uninstall the current version (see the [Uninstall Guide](uninstall.md)).
    *   Download the latest package from [GitHub Releases](https://github.com/Taylor8484/outlook-for-linux/releases).
    *   Perform a clean installation.

#### Issue: Missing mail or a broken page after an Electron update

**Description:** After an update that changes the Electron version, the web app may show stale or missing content, or fail to load properly. This is typically related to a change in the user agent or incompatible cached data.

**Potential Causes:**
*   Change in user agent string with new Electron version.
*   Incompatible cached data from previous versions.

**Solutions/Workarounds:**

1.  **Remove Stored Data:** Removing the stored data in the configuration directory usually resolves the problem. This signs you out.

    **Configuration Folder Locations:**

    | Type of install | Location | Clean-up command |
    | :----------------------: | :---------------------------------------------------------------------------: | :----------------------------------------------------------------------------------: |
    | deb, rpm, AppImage, tar.gz | `~/.config/outlook-for-linux` | `rm -rf ~/.config/outlook-for-linux` |
    | From source | `~/.config/Electron/` | `rm -rf ~/.config/Electron/` |

---

### User Interface (UI) and User Experience (UX)

#### Issue: No rendering fonts correctly

**Description:** Fonts do not render correctly, appearing as squares.

**Potential Causes:**
*   Corrupted fontconfig cache.

**Solutions/Workarounds:**

1.  **Clear Fontconfig Cache:**
    ```bash
    sudo rm /var/cache/fontconfig/*
    rm ~/.cache/fontconfig/*
    fc-cache -r
    ```
    This issue is related to the fontconfig cache. The above commands will clear it.

---

#### Issue: Window decorations stuck in dark mode on GNOME systems

**Description:** On GNOME desktop environments, Outlook for Linux window decorations (title bar, borders) remain in dark mode even when the system theme is set to light mode.

**Potential Causes:**
* Earlier versions of Electron had issues with properly responding to GNOME theme changes
* System theme detection not working correctly with certain GNOME versions

**Solutions/Workarounds:**

1. **Update to Latest Version:** current Electron releases include upstream fixes for GNOME theme handling.

2. **Temporary Workaround:**
   ```bash
   xprop -f _GTK_THEME_VARIANT 8u -set _GTK_THEME_VARIANT "light"
   ```
   Run this command while Outlook for Linux is running to force light window decorations

3. **System Theme Settings:**
   * Ensure your GNOME theme preference is properly set:
   ```bash
   gsettings set org.gnome.desktop.interface color-scheme prefer-light
   ```

---

#### Issue: System tray icon missing on Ubuntu Unity

**Description:** On Ubuntu Unity the Outlook for Linux system tray icon does not appear in the top panel. Recent Chromium and Electron dropped support for the legacy libappindicator library that Unity requires, and now expose the tray only through the newer KStatusNotifierItem protocol, so the icon never registers. This is an upstream Electron limitation rather than an Outlook for Linux bug.

**Potential Causes:**
* Chromium/Electron no longer ship libappindicator support, exposing the tray only via KStatusNotifierItem
* Unity uses libappindicator and does not implement KStatusNotifierItem, so no icon appears

**Solutions/Workarounds:**

Unsetting the `XDG_CURRENT_DESKTOP` environment variable for the app restores the tray on Unity. Rather than editing the packaged `.desktop` file (overwritten on every upgrade), drop an override that shadows it and survives updates.

1. **Per-user override** (recommended for a single machine):
   ```bash
   mkdir -p ~/.local/share/applications
   cp /usr/share/applications/outlook-for-linux.desktop ~/.local/share/applications/
   sed -i 's|^Exec=|Exec=env -u XDG_CURRENT_DESKTOP |' ~/.local/share/applications/outlook-for-linux.desktop
   ```

2. **System-wide override** (for an OEM or fleet image, applies to all users):
   ```bash
   sudo mkdir -p /usr/local/share/applications
   sudo cp /usr/share/applications/outlook-for-linux.desktop /usr/local/share/applications/
   sudo sed -i 's|^Exec=|Exec=env -u XDG_CURRENT_DESKTOP |' /usr/local/share/applications/outlook-for-linux.desktop
   ```

Both locations sit ahead of `/usr/share/applications` in `XDG_DATA_DIRS`, so they shadow the packaged entry and are not touched by `apt upgrade`. The override keeps the default `--ozone-platform=x11` flag intact.

**Note:** `XDG_CURRENT_DESKTOP` also drives the xdg desktop portals (file pickers) and GTK theming, so only unset it where you actually need the tray. The icon may also come up generic rather than the app logo.

**Status:** Upstream Electron limitation ([electron/electron#38979](https://github.com/electron/electron/issues/38979)).

---

### Login and Authentication

#### Issue: Unable to log in, stuck on a blank screen after entering credentials

**Description:** After entering login credentials, the application displays a blank white or black screen and does not proceed to the mailbox.

**Potential Causes:**
*   Authentication session issues.
*   Proxy or network configuration problems.
*   Browser cache issues within the Electron app.

**Solutions/Workarounds:**

1.  **Clear Cache and Data:**
    *   Close Outlook for Linux completely.
    *   Navigate to `~/.config/outlook-for-linux/`.
    *   Delete the entire `Cache`, `Code Cache`, and `Local Storage` directories.
    *   Restart the application and attempt to log in again.

2.  **Check Network and Proxy Settings:**
    *   Ensure your internet connection is stable.
    *   If you are behind a corporate proxy, ensure it is correctly configured (system settings or the `proxyServer` option) and that Outlook for Linux can reach `outlook.office.com` and `login.microsoftonline.com` through it.

#### Issue: OAuth services require internal Electron window

**Description:** Some OAuth services require that authentication windows open inside Electron, but by default Outlook for Linux opens links in an external browser.

**Potential Causes:**
*   Default browser behavior for opening external links.
*   Security restrictions of OAuth providers.

**Solutions/Workarounds:**

1.  **Use Ctrl+Click:** If you need to open a link within an Electron window, use the `Ctrl+Click` combination.

#### Issue: Blank Page at Login

**Description:** A blank page appears at login and the web app never finishes initializing.

**Potential Causes:**
*   Corrupted application cache.
*   Issues with rendering the login page.

**Solutions/Workarounds:**

1.  **Refresh the Window:**
    *   Right-click the tray icon and select Refresh (or use Ctrl+R).

2.  **Clear Application Cache:**
    *   Close the application and delete the cache folder of the default session partition:
        `~/.config/outlook-for-linux/Partitions/outlook-4-linux/Application Cache`
    If the blank page returns after reloading or closing the app, repeat the cache deletion step.

---

#### Issue: Blank "Waiting for network" screen behind a TLS-inspecting proxy

**Description:** On a corporate network that intercepts TLS (a proxy re-signs every HTTPS
connection with an internal CA), the window stays on a blank screen titled "Waiting for
network" and never loads. Debug logs show repeated `net_error -202`
(`ERR_CERT_AUTHORITY_INVALID`) handshake failures, often alongside AIA fetch errors, ending
in `ERR_CONNECTION_CLOSED` for the main frame.

**Potential Causes:**
*   The corporate root CA is installed in the system store only. On Linux, Chromium and
    Electron read a per-user NSS database, not the system OpenSSL store, so
    `update-ca-certificates` does not reach the app on Debian and Ubuntu.
*   The proxy serves an incomplete chain and the intermediate is not trusted locally either.

**Solutions/Workarounds:**

1.  **Import the CA into the NSS database:** see
    [Certificate Management](certificate.md#linux-the-system-ca-store-is-not-enough) for the
    `certutil` steps and the correct database path.

2.  **On Fedora, RHEL and openSUSE:** `update-ca-trust` is sufficient, because those
    distributions route NSS trust through `p11-kit-trust`.

---

#### Issue: Third-Party SSO Login Fails (e.g. Symantec VIP)

**Description:** Users with third-party SSO providers like Symantec VIP see a broken or blank login page. Console logs may show `EvalError` or Content Security Policy violations referencing `strict-dynamic` or `nonce-` directives.

**Cause:** With `contextIsolation` disabled (required for the wrapper's DOM integration), Electron erroneously enforces report-only CSP headers as blocking policies.

**Solutions/Workarounds:**

The app automatically strips report-only CSP headers from third-party sign-in pages. No configuration is needed; make sure you are running the latest release. If a provider still fails, [open an issue](https://github.com/Taylor8484/outlook-for-linux/issues) with the sign-in host name.

#### Issue: Security Key (FIDO2 / WebAuthn) sign-in fails on Linux

**Description:** When signing in with a hardware security key (YubiKey, SoloKeys, Nitrokey, Feitian, etc.) on Linux, the login page spins indefinitely, shows an error, or no PIN dialog appears.

**Cause:** Electron and Chromium on Linux do not ship a native FIDO2 authenticator backend (tracked upstream in [electron/electron#24573](https://github.com/electron/electron/issues/24573)). Outlook for Linux ships an opt-in beta that routes `navigator.credentials` through the `fido2-tools` command-line suite, which talks to the security key over `/dev/hidraw*`.

**Solutions/Workarounds:**

1. Install `fido2-tools` on your system (the deb and rpm packages list it as a recommended dependency, so most installs already have it):
    - Debian / Ubuntu: `sudo apt install fido2-tools`
    - Fedora: `sudo dnf install fido2-tools`
    - Arch: `sudo pacman -S libfido2`

2. Enable the beta feature in `~/.config/outlook-for-linux/config.json`:

    ```json
    {
      "auth": {
        "webauthn": {
          "enabled": true
        }
      }
    }
    ```

3. Plug your key in **before** triggering sign-in. The v1 implementation uses the first connected FIDO2 device. If you see a "No FIDO2 hardware device found" error, the key was not detected.

4. Verify the key is visible to libfido2 from a terminal: `fido2-token -L`. If this says "permission denied" on `/dev/hidraw*`, your user is not in the correct group. libfido2 typically ships a udev rule; if it did not install or is missing, add your user to the group your distribution uses for HID access (often `plugdev` on Debian/Ubuntu, or install `libfido2-udev` if your package manager has it). Replug the key after fixing group membership.

5. If the PIN dialog appears but sign-in still fails, enable debug logging and capture a fresh attempt:

    ```json
    {
      "auth": {
        "webauthn": {
          "enabled": true,
          "debug": true
        }
      },
      "logConfig": {
        "transports": {
          "file": { "level": "debug" }
        }
      }
    }
    ```

    Then tail the log during a sign-in attempt and attach the matching lines to your issue report:

    ```sh
    tail -F ~/.config/outlook-for-linux/logs/main.log | grep -i webauthn
    ```

    Logs are scrubbed of credential IDs, challenges, user handles, PINs, and raw origins before writing. Origins appear as one of `login.microsoftonline.com | login.microsoft.com | login.live.com | other` and errors as coarse buckets (`NO_CREDENTIALS | BAD_PIN | TIMEOUT | CANCELLED | NOT_ALLOWED | SECURITY | INVALID | OTHER`).

**Beta notes:** This feature is opt-in while hardware coverage is still being validated. The single-device restriction, assertion echo-offset heuristic, and PIN-prompt stderr detection are all areas under active validation. Starting the sign-in from the passkey button (without typing your email first) uses the key's resident credentials, which requires a key that supports CTAP 2.1 credential management; if the key holds credentials for more than one account on the site, that flow stops with an error, as an account picker is not implemented yet. Typing your email address first works in both cases. Please report hardware combinations (key model, Linux distribution, libfido2 version) that work or fail.

**Related:** [ADR 021](./development/adr/021-webauthn-fido2-linux.md).

#### Issue: Google Sign-in shows "This browser or app may not be secure"

**Description:** When signing in with a Google account ("Sign in with Google"), Google's password page rejects the login with "This browser or app may not be secure". Microsoft work, school, and personal accounts are unaffected.

**Cause:** Google's sign-in flow inspects the browser user agent and blocks user agents it does not recognize as a trusted app or browser. Outlook for Linux ships a Chrome user agent with the Electron token removed (Microsoft sign-in misbehaves when the Electron token is present), but Google's check also wants an application-identifier token in the string, which the default user agent does not carry.

**Solutions/Workarounds:**

Set a custom `platform.chromeUserAgent` in your `config.json` file (see the [Installation and Updates](#installation-and-updates) section for the configuration folder path corresponding to your installation method) so the user agent carries an application-identifier token, then restart the app. Take the default user agent from the [configuration reference](configuration.md) and insert a token such as `outlook-for-linux/1.0` before the `Chrome/...` segment:

```json
{
  "platform": {
    "chromeUserAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) outlook-for-linux/1.0 Chrome/<your-chrome-version> Safari/537.36"
  }
}
```

Replace `<your-chrome-version>` with the Chrome version Outlook for Linux reports. Any stable application-identifier token works; the requirement is only that one is present. The default user agent is intentionally left without one, because changing it for everyone would risk other Microsoft sign-in methods.

---

### Notifications

#### Issue: No Desktop Notifications

**Description:** Some Linux notification daemons do not fully support the implementation used by Microsoft in their web version, which may result in certain notifications not being shown.

**Potential Causes:**
*   Incompatibility between Linux notification systems and the web app's notification implementation.
*   Incorrect notification settings, either in the app configuration or in Outlook's own notification settings.

**Solutions/Workarounds:**

1.  **Check Outlook's settings:** make sure desktop notifications are enabled under Settings → General → Notifications in Outlook on the web.
2.  **Check Configuration:** Please refer to the `notificationMethod`, and other notification settings, in the [Configuration Documentation](configuration.md) for more information.

---

#### Issue: Notifications disappear from the notification center on GNOME

**Description:** On GNOME (and some other desktops), system notifications vanish from the notification center when the web app's own in-page notification times out, before the user has had a chance to read them.

**Potential Causes:**

* On the default `web` notification method, the web app can call `notification.close()` when its own in-page notification times out. That call propagates through Chromium's DOM `Notification` API to libnotify, which then dismisses the system notification.

**Solutions/Workarounds:**

1. Switch to the `electron` notification method, which keeps the system notification independent of the web app's lifecycle. Optionally also set `notifications.timeoutType: "never"` so notifications persist until you dismiss them:

    ```json
    {
      "notificationMethod": "electron",
      "notifications": { "timeoutType": "never" }
    }
    ```

---

### Wayland & Display Issues

:::info Default Behavior
Outlook for Linux currently launches with --ozone-platform=x11 by default on all Linux packaging formats. If you are on a Wayland session and want native Wayland, override on the command line or in your .desktop file with --ozone-platform=wayland.
:::

#### Issue: Blank or black window on Wayland

**Description:** The application window appears blank, black, or white when running on a Wayland session. This is caused by Electron 38+ regressions in native Wayland mode.

**Solutions/Workarounds:**

1. **Force X11 mode** by launching with `--ozone-platform=x11`:
    ```bash
    outlook-for-linux --ozone-platform=x11
    ```
2. **Confirm the default sticks:** `--ozone-platform=x11` is the shipped default. If you have previously edited your `.desktop` file, ensure the `Exec=` line still includes `--ozone-platform=x11`.

See [ADR 031](./development/adr/031-ozone-platform-x11-default.md) for why X11 remains the default.

#### Issue: Maximized window has gaps or resizes on focus loss

**Description:** Maximizing the window doesn't fill the screen completely, leaving gaps. The window may also shrink when it loses focus.

**Solutions/Workarounds:**

1. **Force X11 mode** with `--ozone-platform=x11` to avoid Wayland window management regressions.

#### Issue: Blurry UI or fonts with fractional scaling on Wayland

**Description:** Text and UI elements appear blurry when using fractional display scaling (e.g., 125%) on Wayland while running under XWayland (X11 mode).

**Potential Causes:**
* X11 mode does not handle Wayland fractional scaling natively.

**Solutions/Workarounds:**

1. **Override to native Wayland mode** (if you don't experience other Wayland bugs):
    ```bash
    outlook-for-linux --ozone-platform=wayland
    ```
2. **Edit your `.desktop` file** to make the override permanent. Replace `--ozone-platform=x11` with `--ozone-platform=wayland` in the `Exec=` line.

#### Issue: Sluggish scrolling or rendering on Wayland

**Description:** Scrolling through the mailbox or opening messages feels slow on Wayland sessions. Outlook for Linux disables GPU composition on Wayland by default, forcing software rendering even on stacks that would handle hardware acceleration fine.

**Potential Causes:**
* Outlook for Linux automatically disables GPU composition on Wayland sessions by default to ensure stability, which can result in software-based rendering.

**Solutions/Workarounds:**

1. **Re-enable GPU acceleration** by setting `performance.disableGpu` to `false` in your `config.json` file (see the [Installation and Updates](#installation-and-updates) section for the configuration folder path corresponding to your installation method):
    ```json
    {
      "performance": {
        "disableGpu": false
      }
    }
    ```
2. **Verify hardware acceleration** is active via **Debug → Open GPU Info** from the application menu (or `chrome://gpu` via DevTools).

#### Issue: Rendering glitches or GPU process errors on X11

**Description:** On X11 sessions, parts of the window fail to render or flicker, and the log contains GPU process errors such as `SharedImageManager::ProduceSkia: Trying to Produce a Skia representation from a non-existent mailbox.` Newer Chromium releases have regressed GPU SharedImage handling on several driver stacks (NVIDIA proprietary, AMD, and Intel integrated graphics), so this is not vendor-specific.

**Potential Causes:**
* X11 sessions keep GPU acceleration on by default (unlike Wayland, which auto-disables), so a Chromium GPU regression is hit unmodified.

**Solutions/Workarounds:**

1. **Disable GPU acceleration** by setting `performance.disableGpu` to `true` in `~/.config/outlook-for-linux/config.json`:
    ```json
    {
      "performance": {
        "disableGpu": true
      }
    }
    ```
2. **Alternatively**, launch with `--disable-gpu` on the command line, or add it to the `Exec=` line of a custom copy of the `.desktop` entry under `~/.local/share/applications/outlook-for-linux.desktop`.

:::note Important
The `performance.electronCLIFlags` config option (`config.json`) **cannot** override `--ozone-platform` because the flag must be set before the Electron process starts, and config is loaded after. Use command-line arguments or `.desktop` file edits instead.
:::

---

### Other

#### Issue: Spellchecker Not Working

**Description:** The bundled `node_spellchecker` only includes the `en_US` dictionary.

**Potential Causes:**
*   Limited dictionary support in the default spellchecker.

**Solutions/Workarounds:**

1.  **Enable Local Dictionaries:** Enable the use of local dictionaries by installing Hunspell along with your locale's dictionary. See the instructions at [Atom's spell-check README](https://github.com/atom/spell-check#debian-ubuntu-and-mint).
2.  **Choose languages:** set `spellCheckerLanguages` in your config; see [Configuration](configuration.md).
