# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> [!NOTE]
> Comprehensive documentation lives in `docs-site/docs/` (Docusaurus, published to https://taylor8484.github.io/outlook-for-linux/). Read the local markdown rather than fetching the web version.

## What this repo is

Outlook for Linux is an unofficial Electron wrapper around the Outlook web app (`https://outlook.office.com/mail/`). It is a **re-fork of [teams-for-linux](https://github.com/IsmaelMartinez/teams-for-linux) v2.21.0**: the shared git history is kept on purpose, the Teams-only features (calls, screen sharing, camera/mic tools, backgrounds, stickers, quick chat, meeting join, MQTT, idle/presence, Graph API, deep links) were removed, and the rest was retargeted at Outlook.

- The remote `upstream` points at teams-for-linux. Bring in upstream fixes with `git merge upstream/main` rather than hand-porting. Keep Outlook-specific edits small and localized so those merges stay tractable; modify/delete conflicts on removed Teams modules resolve by keeping the deletion.
- Default branch is `develop-outlook`. CI, release-please and the docs deploy run against it.
- Many code comments inherited from upstream still say "Teams". Treat them as describing the web app in general, and fix them when you touch the code around them.

## Commands

```bash
npm ci                         # install (npm, not yarn; Node 24 per .nvmrc)
npm start                      # run from source (prestart runs npm ci)
npm run lint                   # CI lint command
npm run test:unit              # node --test 'tests/unit/*.test.js'
node --test tests/unit/profilesManager.test.js   # a single unit test file
npm run test:e2e               # Playwright against the real app (opens windows)
npm run generate-config-docs   # REQUIRED after editing app/config/options.js (CI drift guard)
npm run generate-ipc-docs      # after adding/changing IPC channels
npm run dist:linux             # deb/rpm/tar.gz/AppImage via electron-builder
cd docs-site && npm ci && npm run build   # docs build; onBrokenLinks is 'throw'
```

- `npm run lint` passes `**/*.js` unquoted, so the shell expands it and only one directory level is linted. For a real check run `npx eslint 'app/**/*.js' 'tests/**/*.js' 'scripts/**/*.js'`. That surfaces errors inherited from upstream (webauthn modules, ESM e2e specs parsed as CommonJS); don't add new ones.
- Run from source, the Electron app name is `Electron`, so user data goes to `~/.config/Electron`. Use `E2E_USER_DATA_DIR=<dir>` for a throwaway profile. Packaged builds use `~/.config/outlook-for-linux` (config in `config.json` there, system-wide `/etc/outlook-for-linux/config.json`).
- Every build runs `scripts/generateReleaseInfo.js`, which fails unless `io.github.taylor8484.outlook_for_linux.appdata.xml` has a `<release>` with notes for the current `package.json` version.

## Architecture

**Main process** (`app/index.js`): installs IPC security, builds `AppConfiguration`, creates the services (notifications, custom toasts, downloads, partitions, profiles), then on `ready` calls `mainAppWindow.onAppReady(appConfig, profilesManager)` and wires the optional features (client-certificate PIN, CA allowlist, WebAuthn, global shortcuts, AppImage auto-updater, multi-account views).

**Configuration** (`app/config/`): `options.js` is the single schema (yargs options plus doc/schema generator input). Values come from CLI args, env vars and the merged system + user `config.json`. ADR-025 is migrating flat option names to nested namespaces: modules still read the **flat** key, and `renames.js` projects a user-supplied nested value onto it. Adding an option means `options.js` (plus a `renames.js` entry if it has both spellings) and `npm run generate-config-docs`.

**Main window** (`app/mainAppWindow/`):
- `browserWindowManager.js` creates the `BrowserWindow` with `contextIsolation: false` (needed so `preload.js` can replace `window.Notification` in the page's context), compensated by the IPC allowlist.
- `index.js` owns everything that talks to the web session: auth-cookie cleanup on start/resume, keeping the MSAL cache-encryption cookie persistent, opt-in auth recovery (`auth.reauthRecovery`, triggered by MSAL `InteractionRequired` from `TRUSTED_AUTH_SOURCES`), telemetry host blocking, report-only CSP stripping for non-Outlook hosts, the `about:blank` popup workaround for MSAL silent auth, and link handling (external browser by default, Ctrl+click prompts to open in-app). Command-line args that are Outlook URLs load into the running window.
- `app/connectionManager/` does the actual `loadURL`/reload after an online check.

**Renderer** (`app/browser/preload.js`): overrides `window.Notification` (routing to `web`, `electron` or `custom` via `notificationMethod`), exposes `globalThis.electronAPI`, forwards renderer errors to main, and loads the browser tools: `zoom`, `shortcuts`, `emulatePlatform`, `webauthnOverride`, `trayIconRenderer`.

**IPC**: `app/security/ipcSecurity.js` wraps `ipcMain.handle/on/once` so every renderer-initiated channel must be in `app/security/ipcValidator.js`. For a new channel: add a descriptive comment above the registration, add it to the allowlist, run `npm run generate-ipc-docs`. `tests/unit/ipcValidator.test.js` fails if a registered channel is missing from the allowlist.

**Multi-account** (`multiAccount.enabled`, mutually exclusive with Intune): `app/profilesManager/` persists profiles; `app/mainAppWindow/profileViewManager.js` overlays one `WebContentsView` per profile on the main window. Profile 0 is the root window itself on the legacy partition `persist:outlook-4-linux`; other profiles use `persist:outlook-profile-<uuid>`. Known gap: profile views don't get the root window's popup, request, Intune or password pre-fill handlers.

**Sign-in helpers**: `app/intune/` (Microsoft Identity Broker over D-Bus), `app/webauthn/` (FIDO2 keys via `fido2-tools`, Linux only), `app/clientCertificate/` + `app/_shared/securePrompt*` (smartcard PIN), `app/ssoPasswordPrefill/` (web login form pre-fill), `app/login/` (native HTTP Basic/NTLM dialog), `app/certificate/` (custom CA fingerprints).

### Critical: preload IPC module list

`modulesRequiringIpc` in `app/browser/preload.js` **must** contain `trayIconRenderer` and `webauthnOverride`; they get `ipcRenderer` passed to `init()`. Without it the tray/badge updates and security-key support silently break (upstream issue #1902, regressed several times). `tests/unit/preloadModules.test.js` guards this.

## Outlook-specific rules

- **Host lists** exist in several places and must stay in sync: `OUTLOOK_DOMAINS` and `TRUSTED_AUTH_SOURCES` in `app/mainAppWindow/index.js`, `OUTLOOK_HOST_RE` in `app/mainAppWindow/profileViewManager.js`, and the host sets in `tests/e2e/helpers/electronApp.js`, `tests/e2e/notifications.spec.js` and `tests/e2e/authenticated/`. App hosts are `outlook.office.com`, `outlook.office365.com`, `outlook.cloud.microsoft`, `outlook.live.com`. Never match the bare `outlook.com` suffix: it also covers SafeLinks redirectors (`*.safelinks.protection.outlook.com`).
- **Menu accelerators** are registered on the window and beat the page. Outlook on the web uses Ctrl+R (reply), Ctrl+D (delete) and Ctrl+Q (mark as read), so the app menu uses F5 / F12 / Ctrl+Shift+Q. Check Outlook's shortcuts before adding any accelerator.
- **Injected scripts** must be defensive: Outlook's DOM changes without notice.
- **Open follow-ups** (see `docs-site/docs/development/plan/roadmap.md`): the unread badge still relies on a `(N)` title prefix (`mutationTitle.js`) that Outlook doesn't reliably set; there is no `mailto:` handler; Outlook pop-out/print windows are denied by the `about:blank` workaround and default link handling; per-profile popup/auth wiring; the profile switcher pill position was chosen for the Teams layout.

## Conventions

- `const`/`let` only (`no-var`), `===` (`eqeqeq`), async/await, `#private` class fields, CommonJS modules.
- New functionality goes in its own `app/<module>/` with a README, not in `app/index.js`. Update the module README and `docs-site/docs/development/module-index.md` when behaviour changes.
- **Never log PII**: no emails, usernames, account/tenant IDs, tokens, URL query strings, certificate details or config values. Log structured, non-identifying data (`console.error('[AUTH] failed', { code })`). PII-carrying debug logs are allowed only on feature branches, marked `// DEBUG-ONLY: Remove before merge` (`tests/unit/debugOnlyMarkers.test.js` checks this). Renderer error text is passed through `app/utils/logSanitizer.js`.
- Unit tests have no DOM (`node:test` + `node:vm`), so tests for injected browser scripts assert on source text. To check real renderer behaviour, run a throwaway main script with `node_modules/.bin/electron probe.js` using hidden windows and `executeJavaScript`.
- Commits follow Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:` …); release-please builds the changelog and a **draft** GitHub release from them.
