# Security Architecture & Considerations

This document outlines the security architecture, design decisions, and compensating controls implemented in Outlook for Linux, particularly around the preload/DOM access requirements and the resulting security trade-offs.

## Security Context

### The DOM Access Requirement

Outlook for Linux runs browser tools inside the Outlook web app's page to integrate it with the desktop:

- **Unread Count and Tray Badge**: Read the page title / DOM to derive the unread count shown on the tray icon
- **Notifications**: Bridge web notifications to native notifications or the custom toast
- **Authentication Enhancements**: WebAuthn/FIDO2 interception and opt-in SSO pre-fill on Microsoft sign-in pages
- **Keyboard Shortcuts and Zoom**: In-page shortcut handling and zoom control

### Security vs. Functionality Trade-off

The application faces a fundamental security vs. functionality trade-off:

**Option A: Maximum Security**
- Enable Electron `contextIsolation` and `sandbox` on the main window
- ❌ Breaks the in-page browser tools that the integrations depend on

**Option B: Balanced Security** (Current Approach)
- Disable `contextIsolation` and `sandbox` for the main window only
- ✅ Keep in-page integrations working
- ✅ Implement compensating controls
- ✅ Keep every app-owned secondary window fully hardened
- ✅ Recommend system-level sandboxing

## Current Security Implementation

### Electron Security Configuration

```javascript
// app/mainAppWindow/browserWindowManager.js
webPreferences: {
  contextIsolation: false,  // Required for in-page browser tools
  nodeIntegration: false,   // Secure: preload scripts don't need this
  sandbox: false,           // Required for system API access
}
```

**Key Security Decision**: `nodeIntegration` remains `false` to prevent Node.js access in renderer processes, maintaining a critical security boundary.

### Compensating Security Controls

#### IPC Channel Validation

**Implementation**: `app/security/ipcValidator.js` and `app/security/ipcSecurity.js`

**Features**:
- **Channel Allowlisting**: Only legitimate IPC channels are permitted
- **Recursive Payload Sanitization**: Removes dangerous properties (`__proto__`, `constructor`, `prototype`) from payloads at all nesting depths
- **Prototype Pollution Protection**: Guards against object prototype manipulation with depth-limited recursion (max 10 levels)
- **Request Validation**: Validates all IPC requests before processing

```javascript
function validateIpcChannel(channel, payload = null) {
  if (!allowedChannels.has(channel)) {
    console.warn(`[IPC Security] Blocked unauthorized channel: ${channel}`);
    return false;
  }
  sanitizePayload(payload); // Recursive sanitization
  return true;
}
```

#### Origin Allowlists for Sensitive Features

Features that act on credentials only run against known sign-in origins:

- **WebAuthn / FIDO2** (`app/webauthn/`): requests are validated against the Microsoft login allowlist (`login.microsoftonline.com`, `login.microsoft.com`, `login.live.com`), extendable via `auth.webauthn.extraOrigins`
- **SSO password pre-fill** (`app/ssoPasswordPrefill/`): only runs on Microsoft/federated login hosts, extendable via `auth.webLogin.extraHosts`

**Protection**: Prevents an arbitrary page loaded in the window from triggering credential flows.

#### Hardened Secondary Windows

App-owned windows that do not need access to the Outlook page run with full isolation (`contextIsolation: true`, `sandbox: true` where supported, `nodeIntegration: false`):

- Secure prompts for PINs and passwords (`app/_shared/securePrompt.js`, WebAuthn PIN dialog)
- Profile dialogs (`app/_shared/createDialogWindow.js`)
- Custom notification toasts (`app/notificationSystem/`)

Secrets such as smartcard or security-key PINs are collected in these windows and never enter the Outlook renderer ([ADR-021](adr/021-webauthn-fido2-linux.md), [ADR-024](adr/024-smartcard-pkcs11-pin-dialog.md)).

#### Process Error Handlers

**Implementation**: `app/index.js` (top-level)

**Features**:
- **`uncaughtException` handler**: Logs error details and exits with code 1 (process state unknown after uncaught exception)
- **`unhandledRejection` handler**: Logs rejection details, allows process to continue (non-fatal)
- **Startup try/catch**: `handleAppReady()` wrapped with error logging and graceful `app.quit()` on failure

**Protection**: Prevents silent process termination and provides diagnostic output for crash reports.

#### Input Sanitization for External Commands

**Implementation**: `app/mainAppWindow/browserWindowManager.js`

**Features**:
- **`sanitizeCommandArg()`**: Validates string type, limits length to 500 characters, strips control characters before values are passed to `spawn()`

**Protection**: Defense-in-depth against edge cases in user-configured commands receiving untrusted data from the web app.

#### Log Sanitization

**Implementation**: `app/utils/logSanitizer.js`, hooked into electron-log by `app/config/logger.js`

Tokens, passwords, emails, IP addresses, URL query parameters and user paths are redacted from all log output ([ADR-013](adr/013-pii-log-sanitization.md)).

## Recommended User-Level Security

### System-Level Sandboxing

Instead of relying solely on Electron security features, users can adopt **system-level sandboxing**:

#### Available Options

**AppArmor/SELinux**
- Available by default on most Linux distributions
- Kernel-level security enforcement
- Fine-grained access control policies

**Manual Sandboxing Tools**
- `firejail`: User-space sandboxing
- `bubblewrap`: Container-based isolation

#### Why System-Level > Application-Level

1. **Preserves Functionality**: In-page integrations remain intact
2. **Better Security**: OS-level controls are more robust than the Electron sandbox
3. **User Choice**: Flexible security levels based on individual needs
4. **Future-Proof**: Works regardless of changes to the Outlook web app
5. **Defense in Depth**: Additional security layer independent of the application

## Session and Credential Storage

Outlook for Linux does not extract or store authentication tokens itself. Cookies, local storage and IndexedDB belong to the Electron session partition (`persist:outlook-4-linux`, plus one partition per profile when multi-account is enabled) and are managed by Chromium. "Quit (Clear Storage)" and `storage.clearData` clear every profile partition.

## Future Security Enhancements

### Long-term Security Goals

1. **Progressive Hardening**: Restore Electron security features where the in-page integrations allow it
2. **Zero-Trust Architecture**: Assume all external inputs are malicious
3. **Automated Security Testing**: Integration of security tests in CI/CD
4. **Sender Checks**: Validate `event.sender` for sensitive IPC handlers in addition to the channel allowlist

## Risk Assessment

### Current Risk Level: LOW

**Effective Security Controls**:
- ✅ **Microsoft's Infrastructure Security**: Outlook on the web runs on Microsoft's secured infrastructure with their security controls
- ✅ **Node.js Access Prevented**: `nodeIntegration: false` maintains a critical security boundary
- ✅ **IPC Validation**: Channel allowlisting and payload sanitization
- ✅ **Hardened Secret Input**: PINs and passwords never enter the web app renderer
- ✅ **PII-Safe Logging**: Sensitive values redacted before logs are written

**Technical Trade-offs** (Mitigated by Above):
- ⚠️ Electron context isolation disabled on the main window for in-page integrations
- ⚠️ Electron sandbox disabled on the main window for system integration features

**Assessment**: The combination of Microsoft's web app security controls, compensating measures, and optional OS-level sandboxing results in a low-risk security posture.

### Continued Security Best Practices

**For Users**:
- Download releases only from [GitHub Releases](https://github.com/Taylor8484/outlook-for-linux/releases)
- Keep the application updated (AppImage builds update in-app)
- Follow your distribution's security recommendations

**For Developers**:
- Monitor Outlook web app changes that could affect the in-page integrations
- Maintain IPC channel validation and origin allowlists
- Keep dependencies updated and monitor security advisories

## Security Contact & Reporting

**Security Issues**: Report via [GitHub Security Advisories](https://github.com/Taylor8484/outlook-for-linux/security/advisories)
**Security Questions**: [GitHub Issues](https://github.com/Taylor8484/outlook-for-linux/issues)
**Emergency Contact**: Project maintainer via GitHub
