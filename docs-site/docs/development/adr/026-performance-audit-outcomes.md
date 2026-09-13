---
id: 026-performance-audit-outcomes
---

# ADR 026: Performance Audit Outcomes

:::note Inherited decision
This ADR was written in teams-for-linux, the project Outlook for Linux is based on. Issue and PR numbers refer to the upstream repository. Findings about modules removed in the Outlook conversion are summarised rather than listed.
:::

## Status

✅ Accepted

## Context

The upstream system performance research (March 2026, re-verified July 2026) catalogued ten performance-sensitive patterns across renderer-side browser tools, main-process I/O, and network handling, plus a proposal for a lightweight metrics module. Every item received an outcome, recorded here; the research document was deleted upstream and remains in that project's git history.

## Decision

Each finding is closed as fixed, fixed differently, or not planned with a recorded reason. Accepted residual costs carry a stated magnitude so a future report can be triaged against them.

| # | Finding | Outcome | Notes |
|---|---------|---------|-------|
| 4 | Tray icon canvas and dataURL re-creation per update | Fixed (upstream PR #2837) | The base-icon `toDataURL()` result is cached. The resize path deliberately remains, costing two canvas creations plus `getContext("2d")` plus a `toDataURL()` per tray update |
| 5 | `shortcuts.js` ready-polling had no retry limit | Fixed | `MAX_READY_RETRIES = 30` caps both ready loops |
| 6 | Sequential recursive directory walk in `cacheManager` | Fixed (upstream PR #2837) | `readdir` with `withFileTypes` dirents, processed in sequential chunks of 32 with `allSettled` isolation per entry. The chunk bounds concurrency per directory, not across the recursion, so the worst case is exponential in tree depth. Accepted because Chromium cache trees are wide and shallow; a shared semaphore is the pre-scoped lever if this ever runs over a deep tree |
| 7 | Listeners never removed on window close | Not planned | `app.quit()` follows window close immediately, so cleanup is moot while the app stays single-window. Revisit if crash-recovery window recreation or pop-out windows are built |
| 8 | Offline detection probes could block indefinitely | Fixed differently | See rationale below |

**Moot in Outlook for Linux:** findings 1, 2, 3, 9 and 10 concerned `timestampCopyOverride` polling, two full-subtree MutationObservers (`mqttStatusMonitor` and `injectedScreenSharing`), the screen-sharing button scan, WebRTC stats polling in `speakingIndicator`, and idle-state IPC in `activityManager`. None of those modules exist in this app, so those findings no longer apply.

### Offline detection: a timeout budget that never declares offline (item 8)

The research claimed a 10 second worst case; the git history showed worse. Before upstream PR #2635 the probes carried no timeouts, so a hung socket never settled and the check could block indefinitely (upstream #2611). #2635 added a per-probe `PROBE_TIMEOUT_MS` of 5000 ms, bounding the sequential sweep at roughly 85 seconds. Upstream PR #2816 added an overall `ONLINE_CHECK_BUDGET_MS` of 20000 ms in `app/connectionManager/index.js`, checked before each probe; on exhaustion the sweep stops and assumes online rather than declaring offline. The research's `Promise.any()` recommendation, racing the strategies in parallel, was not adopted: the budget bounds the worst case without firing redundant requests on every check.

### Instrumentation proposals declined

Of the three proposals, the periodic memory logger, a five-minute `process.memoryUsage()` timer, is rejected on standing-cost grounds: a permanent timer for a diagnostic need that has not arisen. One-shot startup marks and an on-demand `get-perf-metrics` IPC handle are declined as unneeded now, though both are nearly free because `electron-log` already captures console output to the log file. The project deliberately has no performance instrumentation; `electron-log` and `chrome://gpu` remain the only runtime observability.

## Consequences

### Positive

Every applicable finding is fixed or carries an explicit reason, a stated magnitude where a residual cost is accepted, and a reopen trigger that works without instrumentation. Removing the call, presence, screen-sharing and MQTT modules in the Outlook conversion eliminated the remaining renderer-side hot spots the audit had accepted.

### Negative

Without instrumentation, a future regression surfaces as a user-supplied DevTools profile or CPU observation rather than a metric. New Outlook-specific browser tools (for example a DOM-based unread counter) should be written with bounded polling and narrowly scoped observers from the start.

## Related

- Upstream #2611, PR #2635 and PR #2816, the offline detection history behind item 8
- `app/connectionManager/index.js`, `app/browser/tools/shortcuts.js`, `app/browser/tools/trayIconRenderer.js`, `app/cacheManager/index.js`, `app/mainAppWindow/index.js`
