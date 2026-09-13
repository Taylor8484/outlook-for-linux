# Browser Tools

Client-side scripts that are injected into the Outlook web interface to provide enhanced functionality and integrate with the desktop environment.

## Overview

These tools operate in the renderer process and interact directly with the Outlook web application DOM and APIs. They are loaded via the preload script and initialized based on configuration settings.

## Available Tools

### Core Functionality

#### [mutationTitle.js](mutationTitle.js)  
Uses MutationObserver to track title changes for unread message counting and tray icon updates.

### UI & Display

#### [trayIconChooser.js](trayIconChooser.js) & [trayIconRenderer.js](trayIconRenderer.js)
Handle tray icon selection, rendering, and badge count display based on the unread count.

#### [zoom.js](zoom.js)
Manages zoom level controls and persistence across sessions.

### System Integration

#### [emulatePlatform.js](emulatePlatform.js)
Modifies platform detection to improve Outlook web compatibility on Linux.

#### [shortcuts.js](shortcuts.js)
Implements custom keyboard shortcuts for in-app actions like zoom control and navigation.

#### [webauthnOverride.js](webauthnOverride.js)
Patches `navigator.credentials.create()` and `.get()` to route WebAuthn requests through IPC to the main process, which talks to hardware security keys via `fido2-tools`. Linux only. See the [WebAuthn module README](../../webauthn/README.md).

**Configuration**: Requires `auth.webauthn.enabled: true` in config
**Requires**: `ipcRenderer` passed during initialization

#### Global Shortcuts System (Main Process)
System-wide keyboard shortcuts that work even when Outlook is not focused. When triggered, the keyboard event is forwarded to Outlook, which handles it with its built-in shortcuts. Configured via the `shortcuts.global` array in `config.json` (the flat `globalShortcuts` is deprecated but still accepted).

**Disabled by default** - opt-in by adding shortcuts to your config.

**How it works**: The main process registers global shortcuts and forwards keyboard events to Outlook's window, allowing Outlook's native shortcuts to work system-wide without needing to find buttons in the DOM.

**Configuration Example** (add to config.json to enable):
```json
{
  "shortcuts": {
    "global": [
      "Control+Shift+M"
    ]
  }
}
```

Choose combinations that match the keyboard shortcut set selected in Outlook on the web (**Settings → General → Accessibility → Keyboard shortcuts**).

**Important Notes**:
- ⚠️ **QWERTY keyboard layout only**: Shortcuts are based on physical QWERTY key positions
- ⚠️ **macOS**: Non-QWERTY layouts (Dvorak, AZERTY, Colemak, etc.) are **not supported** due to [Electron bug #19747](https://github.com/electron/electron/issues/19747)
- On Linux/Windows: Works better but may have issues with layout changes during runtime

Set to empty array `[]` or omit from config to disable. See [Electron Accelerators](https://www.electronjs.org/docs/latest/api/accelerator) for key combinations.

## Architecture Patterns

### Initialization
All tools follow a consistent initialization pattern:
```javascript
function init(config, ipcRenderer) {
  if (!config.featureEnabled) {
    console.debug("[TOOL_NAME] Feature disabled in configuration");
    return;
  }
  // Tool implementation
}

module.exports = { init };
```

### Configuration-Driven
Tools are conditionally loaded based on configuration settings passed from the main process.

### Logging Standards
Tools use consistent logging patterns with tool-specific prefixes:
- `[TRAY_DIAG]` for tray diagnostics
- `[SHORTCUTS]` for keyboard shortcut handling
- `[WEBAUTHN]` for security key relay

### Error Handling
Tools implement defensive programming practices since the Outlook DOM can change without notice:
- Try-catch blocks around DOM operations
- Graceful degradation when APIs are unavailable
- Feature detection before attempting operations

## Adding New Tools

When creating new browser tools:

1. **Follow naming conventions**: Use camelCase for file names
2. **Implement standard init pattern**: Accept `config` and optional `ipcRenderer` parameters
3. **Add configuration option**: Update `app/config/options.js` with new settings
4. **Register in preload**: Add to modules array in `app/browser/preload.js`
5. **Document thoroughly**: Add to this README and relevant docs
6. **Use consistent logging**: Follow `[TOOL_NAME]` prefix pattern
7. **Handle errors gracefully**: Outlook DOM can change unexpectedly

## Security Considerations

- Tools operate in renderer context with access to Outlook web content
- Sensitive operations should use IPC communication with main process
- Validate all DOM queries as Outlook interface can change
- Follow principle of least privilege for DOM access
