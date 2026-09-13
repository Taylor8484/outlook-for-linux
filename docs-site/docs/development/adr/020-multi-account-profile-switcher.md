---
id: 020-multi-account-profile-switcher
---

# ADR 020: Multi-Account Profile Switcher

:::note Inherited decision
This ADR was written in teams-for-linux, the project Outlook for Linux is based on. Issue and PR numbers refer to the upstream repository. Rows and audit entries about features removed in the Outlook conversion (MQTT, custom backgrounds, screen sharing, incoming-call toasts) have been dropped.
:::

## Status

✅ Implemented (Phase 1)

Phase 1 landed incrementally upstream: the `multiAccount.enabled` flag and Intune mutex (upstream PR #2450), the add-profile dialog with first-run bootstrap (#2496), the manage-profiles dialog with rename and remove (#2510), the Profiles menu (#2489), the switcher pill (#2661), and the `Ctrl+Alt+1…5` pinned-profile shortcuts (#2787). Phase 2 started with a sender-to-profile attribution map (#2865), with per-profile unread aggregation next. Phase 3 is untouched.

For Outlook for Linux, per-profile popup and authentication window wiring is tracked on the [roadmap](../plan/roadmap.md).

## Context

Community demand for hosting multiple Microsoft 365 tenants inside a single running app instance has been consistent for years upstream (#72, #438, #1656, #1830). Users — typically consultants, MSPs, and multi-org employees — need to be logged into several tenants during a working day and want an in-app account switcher.

**Investigation Date:** 2026-04-16

**The earlier workaround** (documented in [Multiple Instances](../../multiple-instances.md)) is the `--user-data-dir` CLI flag, optionally combined with `customUserDir` and per-tenant `--class` / `--appIcon` values. This works but is clunky:

- One tray icon per tenant instead of one unified icon
- Manual `.desktop` entry creation for every new tenant
- No cross-tenant notifications (inactive instances only notify when focused)
- Higher total memory than a shared process
- No in-app UX — the user's mental model is "six separate apps"

**Distinction from multi-window pop-outs:** an earlier upstream ADR (ADR-010, not carried over because it concerned the Teams web app) rejected **multiple `BrowserWindow`s for a single account**. This ADR covers **multiple accounts inside a single `BrowserWindow`** — a different problem with a compatible solution. Outlook pop-out windows are a separate follow-up on the roadmap.

The `BrowserView` API has since been superseded by `WebContentsView` (Electron 30+), which is the current recommendation.

## Decision

**Adopt a single-`BrowserWindow` + one-`WebContentsView`-per-profile architecture.** The application remains a single window with a single tray icon and a single instance lock.

- **Feature-flag gated.** The entire feature is opt-in via `multiAccount.enabled` in `config.json` (default `false`). When disabled, behavior is identical to single-profile operation. See § "Feature Flag & Scope".
- Each profile is bound to its own persistent `session.fromPartition('persist:…')` partition keyed by a UUID generated once at profile creation (`crypto.randomUUID()`) and immutable for the view's lifetime. The `persist:` prefix is what tells Electron to persist cookies and storage for that partition.
- All profile views are instantiated up front as children of `mainWindow.contentView`. Switching toggles visibility via `contentView.addChildView` / `removeChildView` and bounds updates — **no `loadURL` on switch**, so sessions stay warm, drafts survive, and the web app's connections are not re-established.
- Profile metadata is stored under `app.profiles` in the existing `settingsStore` (electron-store), not in user-facing `config.json`. When the feature flag is flipped on for the first time, the legacy `persist:outlook-4-linux` session becomes Profile 0 ("My account") with no login loss.

### Rationale

1. **Respects the single-window invariant.** Still exactly one `BrowserWindow`, one tray icon, one instance lock.
2. **Modern, supported Electron API.** `WebContentsView` replaces the deprecated `BrowserView` and `<webview>` tag and is stable in current Electron.
3. **Proven production pattern.** ElectronIM (`manusa/electronim`, Apache-2.0) and Ferdium both ship this exact model.
4. **Keeps sessions warm.** Switching is show/hide, not reload.

## Feature Flag & Scope

### `multiAccount.enabled` (default `false`)

```json
{
  "multiAccount": {
    "enabled": false
  }
}
```

**When `false`:**

- No switcher UI, no `Profiles` menu bar entry.
- Single `persist:outlook-4-linux` partition — identical to single-profile behavior.
- No bootstrap, no migration — `app.profiles` stays empty in `settingsStore`.
- Every existing CLI flag and code path behaves exactly as before the feature shipped.

**When `true`:**

- On first startup after the flag flips, the bootstrap runs: if `persist:outlook-4-linux` has cookies or localStorage, Profile 0 ("My account") is created pointing at that partition, no re-login required.
- The switcher UI, `Profiles` menu bar entry, and keyboard shortcuts activate.

The regression check is that launching with `multiAccount.enabled === false` produces identical behavior, verified via E2E tests (`tests/e2e/multi-account-disabled.spec.js`).

### Mutual exclusion with `auth.intune.enabled`

If both `auth.intune.enabled === true` and `multiAccount.enabled === true` at startup, the app logs a warning and forces multi-account off for that session:

```
[MultiAccount] auth.intune.enabled is true; multi-account is not supported in this configuration and will be disabled for this session.
```

The Linux D-Bus Microsoft Identity Broker has undocumented behavior around concurrent enrollments for different UPNs on one machine, so Intune is treated as single-profile-only.

### Per-profile vs. shared settings

Only four fields live on each `Profile` record in `settingsStore`; everything else is global.

**Per-profile:**

| Field | Type | Purpose |
|-------|------|---------|
| `disableNotifications` | boolean | Silence this profile's notification badges and OS toasts (Phase 2 plumbing) |
| `muted` | boolean | Suppress audio cues from this profile (notification sounds) |
| `pinned` | boolean | Assigns a `Ctrl+Alt+N` keyboard shortcut; up to 5 pinned profiles |
| `url` | string, optional | Per-profile URL override (for example a sovereign-cloud Outlook endpoint); falls back to the global `url` config |

**Shared across all profiles (from `config.json` / CLI switches):**

Tray behavior, tray icon, notification sound, global shortcuts, proxy server, certificate fingerprints, custom user agent, all Electron command-line flags (`--user-data-dir`, `--class`, `--appIcon`, etc.).

This is a conscious MVP narrowing. Making any shared field per-profile is deferred until users ask for it.

## User Experience

All flows are gated on `multiAccount.enabled === true`.

### First-run bootstrap (invisible to the user)

On the first launch after the flag flips, if `app.profiles` is empty and the legacy `persist:outlook-4-linux` session has any cookies or localStorage, a **Profile 0** record is created with:

- `name`: "My account"
- `partition`: `persist:outlook-4-linux` (the existing legacy partition, so the user's login survives)
- `avatarColor`: deterministically derived from a hash of the partition string
- `avatarInitials`: "MA" (editable later)

### Add a profile

1. User clicks `Profiles → Add profile…` on the menu bar.
2. A modal dialog asks for **Name** (required), **URL override** (optional), **Initials** (optional, derived from Name) and **Color** (optional).
3. On save, a new `Profile` record is persisted with a fresh UUID partition; a `WebContentsView` is created against that partition and the user is switched to it.
4. The view loads the Microsoft login page.

### Switch between profiles

**Mouse:** a small avatar pill overlay (`app/profileSwitcher/`, a `WebContentsView` in `mainWindow.contentView`); clicking opens a compact picker listing all profiles with the active one highlighted. A native title-bar button isn't possible on Linux without going frameless. The pill's corner position was chosen upstream against the Teams layout, so its placement over Outlook's UI should be re-verified.

**Keyboard:** `Ctrl+Alt+1…5` jumps directly to pinned profile N. (`Ctrl+Shift+<digit>` was avoided because the upstream web client bound it.) Implemented as window-menu accelerators, so they fire only while the app is focused.

**Mechanism:** visibility toggles via `addChildView` / `removeChildView` and bounds updates, with **no `loadURL`**. Target: under 500 ms switch latency.

### Rename a profile

`Profiles → Manage…` lists profiles; clicking a name enters inline edit. **Enter** or blur saves, **Esc** cancels. The trimmed name must be non-empty (also enforced in `ProfilesManager.update`). The dialog sends `manage-profile-rename`, `ProfilesManager` emits `update`, and the menu and switcher pill rebuild. No session impact.

### Remove a profile

1. `Profiles → Manage…` offers a remove action per row.
2. The active profile and the last remaining profile cannot be removed.
3. On confirmation, the profile's partition is cleared via `session.clearStorageData()`, the `Profile` record is deleted, and the `WebContentsView` is destroyed.

### What does not change for users who don't enable the flag

**With `multiAccount.enabled === false`, every user-visible behavior is identical.** No new menu entries, shortcuts, tray tooltip phrasing or startup logs.

## Compatibility & Phase 1 Limitations

| Area | Current implementation | Phase 1 status | Notes |
|------|------------------------|----------------|-------|
| **Intune** (`app/intune/index.js`) | D-Bus Microsoft Identity Broker bound to `webContents.session` via `onBeforeSendHeaders`. | **Not supported** | Mutually exclusive with `multiAccount.enabled`. |
| **Client certificate auth** | OS-owned (Chromium uses the system cert store); `app/certificate/index.js` validates against configured fingerprints process-wide. | **Works as-is** | Client cert selection cannot be per-session in Electron. |
| **Proxy server** (`--proxy-server` / `config.proxyServer`) | Process-global via `app.commandLine.appendSwitch`. | **Shared proxy only** | Per-profile proxy (via `session.setProxy()`) deferred. |
| **Proxy / auth login dialog** | Per-`webContents` state (`WeakMap<webContents, isFirstTry>`). | **Works as-is** | Each profile's 401 challenge has isolated state. |
| **Global shortcuts / tray** | App-level. | **Works as-is** | Operates on focused window. |
| **Single instance lock** | App-level via `app.requestSingleInstanceLock()`. | **Preserved** | The `second-instance` handler gets a `--profile-id=<uuid>` argument in Phase 3. |
| **Notification system** | `NotificationService` + `CustomNotificationManager`, process-level. | **Active profile only (Phase 1)** | Phase 2 adds a per-partition shim so background profiles can forward unread counts. |

**Explicit Phase 1 non-goals:** Intune alongside multi-account, per-profile proxy servers, per-profile settings beyond the four listed, cross-profile notification aggregation, and per-profile URL defaults beyond the optional override.

## Consequences

### Positive

- ✅ Unified tray icon (aggregated unread badge across profiles in Phase 2)
- ✅ Single instance lock and single window preserved
- ✅ Zero regression for single-profile users — the legacy `persist:outlook-4-linux` partition is auto-migrated as Profile 0
- ✅ `--user-data-dir` / `customUserDir` workflows continue to work as an independent axis
- ✅ Switch latency under ~500 ms; drafts preserved

### Negative

- ⚠️ Memory footprint scales roughly N × single-profile RSS with N warm profiles (optional hibernation is a Phase 3 idea)
- ⚠️ `WebContentsView` is newer than `BrowserView`; community documentation is thinner
- ⚠️ Six Phase 1 `profile-*` IPC channels (`profile-list`, `profile-get-active`, `profile-switch`, `profile-add`, `profile-update`, `profile-remove`) to maintain in the `ipcValidator.js` allowlist
- ⚠️ Module-level singletons need a per-partition audit (see below)
- ⚠️ Intune is not supported alongside multi-account
- ⚠️ All profiles share the globally configured proxy

### Neutral

- Profile config lives in `settingsStore`, not `config.json`
- `customUserDir` continues to exist as an independent axis (each user-data-dir has its own `app.profiles` list)
- Pop-out windows for a single account remain a separate question

## Alternatives Considered

### Option 1: Multiple Independent `BrowserWindow`s

One `BrowserWindow` per tenant in the same process. Rejected: multiplies IPC, tray and auth surface area, and creates ambiguous tray ownership, while the profile-switcher feature does not require it.

### Option 2: Reload Single Window Into Different Partitions Per Switch

Keep one view and re-create it against a different partition with `loadURL` on each switch. Rejected: a full sign-in and reconnect on every switch (~5–10 s) and lost drafts, which is effectively today's `--user-data-dir` workaround wrapped in chrome.

### Option 3: Legacy `<webview>` Tags

Rejected: `<webview>` is discouraged in modern Electron, has weaker isolation than session partitions, and gives no first-class session partition control from main. Ferdium itself moved away from it.

## Migration Plan

- **First-launch bootstrap:** if `app.profiles` is empty and `persist:outlook-4-linux` has cookies or localStorage, create Profile 0 pointing at that exact partition string.
- **CLI flags:** `--user-data-dir`, `--class`, `--appIcon`, `--url`, `--customUserDir` behave identically. `--profile-id=<uuid>` is additive (Phase 3).
- **Single-profile regression check:** launching with an empty `app.profiles` must produce identical behavior.

### Shared-state audit

Module-level singletons that assume a single account, and their state:

| Location | Symptom if not migrated | State |
|----------|------------------------|-------|
| `app/login/index.js` (`isFirstLoginTry`) | Switching profile mid-login mistakes the second profile's first 401 for a retry | Resolved (per-`webContents` `WeakMap`) |
| `app/mainAppWindow/index.js` (`cleanExpiredAuthCookies` runs once against a single partition) | Other profiles' expired auth cookies are never cleaned | Open |
| `app/menus/index.js` ("Quit (Clear Storage)") | Left every other profile's cookies and tokens on disk | Resolved: enumerates profiles and clears each partition |
| `app/mainAppWindow/browserWindowManager.js` (startup `storage.clearData`) | Same single-partition shape as the quit-time clear | Resolved: shares `app/utils/storagePartitions.js` |

## Phased Delivery

- **Phase 1 — MVP:** `multiAccount.enabled` flag with the Intune mutual-exclusion check, per-profile `WebContentsView`s, switcher pill, `Profiles` menu with Add / Switch / Manage flows, `Ctrl+Alt+1…5` pinned-profile shortcuts, first-run Profile 0 migration, the six `profile-*` IPC channels, the login try-state migration, and E2E coverage of the disabled case.
- **Phase 2 — Background notifications:** per-partition preload notification shim and unread-count tagging, aggregated tray badge, per-profile unread dots, `disableNotifications` and `muted` plumbing.
- **Phase 3 — Power features:** `--profile-id` CLI flag end-to-end, keyboard shortcut to cycle profiles, drag-to-reorder.

## Related

- Upstream issues #72, #438, #1656, #1830 and umbrella issue #2495
- [Multiple Instances](../../multiple-instances.md) user guide
- `app/profilesManager/`, `app/profileDialogs/`, `app/profileSwitcher/`, `app/mainAppWindow/profileViewManager.js`, `app/security/ipcValidator.js`

## References

- [ElectronIM source: service-manager](https://github.com/manusa/electronim/blob/main/src/service-manager/index.js)
- [Ferdium Service model](https://github.com/ferdium/ferdium-app/blob/main/src/models/Service.ts)
- [Electron `WebContentsView` docs](https://www.electronjs.org/docs/latest/api/web-contents-view)
- [Electron `session.fromPartition`](https://www.electronjs.org/docs/latest/api/session#sessionfrompartitionpartition-options)
