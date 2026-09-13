---
id: 031-ozone-platform-x11-default
---

# ADR 031: Keep the `--ozone-platform=x11` Default on Wayland

:::note Inherited decision
This ADR was written in teams-for-linux, the project Outlook for Linux is based on. The history below happened upstream; issue and PR numbers refer to the upstream repository. Outlook for Linux inherits the same Electron baseline and packaging, so the decision carries over unchanged.
:::

## Status

✅ Accepted (2026-09-05)

## Context

The app ships `--ozone-platform=x11` as the default on deb, rpm and AppImage builds through the `.desktop` file's `Exec=` line, forcing Chromium into X11 or XWayland rendering even on a native Wayland session. tar.gz builds carry no `.desktop` file, so that setting never reaches them; they fall back to whatever Chromium's `auto` ozone hint selects, which on a Wayland session is native Wayland. Upstream, the flag was added in PR #2040 and #2139 (released in v2.7.4, February 2026) after Electron 38 introduced native Wayland regressions documented as blank or black windows, multi-monitor maximize bugs, and crashes.

The default was re-litigated three times upstream, and every attempt to remove it failed for a different reason:

- **Accidental flip (May 2026):** a documentation PR (#2509) carried a `package.json` hunk that changed the value to the invalid `auto`, breaking every Linux build with a Chromium `FATAL`; #2511 restored `x11` the next day.
- **First real attempt (#2506, May 2026):** dropped the flag on the premise that Chromium defaults `--ozone-platform-hint` to `auto`. It was merged by accident and reverted the same day in #2600, so the change could be rolled out behind a gated plan instead.
- **Electron 42 retry (#2601, June 2026):** testers reproduced a genuine native Wayland regression — a multi-monitor fullscreen window that shrinks the moment focus moves to another monitor (Debian 13, GNOME 48), absent under x11. The PR was closed unmerged, and the community testing tracker (#2508) was closed with the conclusion that Electron's Wayland support was not ready.

X11 by default is not friction free either: upstream reports include keyboard input issues on GNOME Wayland and launch errors when users force `--ozone-platform=wayland`. None argued for removing the default.

## Decision

Keep `--ozone-platform=x11` as the shipped default on deb, rpm and AppImage. The flag lives in `package.json` in the `executableArgs` of electron-builder's `linux` build config, which feeds the `.desktop` file's `Exec=` line for those targets. Where the flag applies, it is baked into the launch command at package time, so it reaches Chromium as a real argv entry before any Electron JavaScript runs, which is what lets it win over anything set later.

On top of that default, `app/startup/commandLine.js`'s `#configureWayland` runs whenever `XDG_SESSION_TYPE` is `wayland` and adjusts Chromium switches for Wayland and XWayland sessions. It detects XWayland by checking whether the explicit `ozone-platform` switch resolved to `x11`, and in that case applies workarounds such as disabling GPU compositing to avoid blank windows unless the user has configured GPU behaviour explicitly.

A user who wants native Wayland can pass `--ozone-platform=wayland` on the command line or edit their `.desktop` file's `Exec=` line, as documented in [Troubleshooting](../../troubleshooting.md). Either is a genuine argv override applied at the same point in startup as the shipped default, so it works reliably where a config option could not.

Reopening this decision needs concrete evidence, not a new Electron release alone:

- An Electron or Chromium baseline beyond 42 verified against the exact #2601 regression: multi-monitor fullscreen on GNOME or KDE, shrinking on focus loss to another monitor.
- A validation pass across several distributions and both major Wayland compositors (GNOME and KDE) on the candidate baseline, not a self-selected subset of commenters.
- Field data from builds that run without the flag (tar.gz, or an opt-in pre-release) showing no comparable rise in Wayland-specific reports.

## Consequences

### Positive

The default matches what most users get without any manual step, avoiding the blank windows and multi-monitor bugs that Electron 38's native Wayland path introduced. The upstream paper trail across #2508, #2600 and #2601 is consolidated here, so the next attempt starts from known failure modes instead of rediscovering them.

### Negative

Users who want native Wayland must opt in per install, and a `.desktop` edit can be silently lost on a package update unless placed in a location documented to shadow the packaged entry. `electronCLIFlags` in `config.json` cannot override this: config is read and applied well after Electron has started, by which point Chromium's ozone backend is already fixed from the real process arguments. Only a genuine command-line argument, from packaging, a shell wrapper, or a hand-edited `.desktop` file, can influence it. Some users do not realize they are running under XWayland, since `XDG_SESSION_TYPE=wayland` alone does not tell them.

### Neutral

`#configureWayland`'s runtime XWayland check only inspects the explicit `--ozone-platform` switch value; it never observes the backend Chromium actually resolves to. A session with no explicit flag (tar.gz, or a user who strips the packaged flag) is treated as native Wayland even if Chromium's `auto` hint falls back to X11. Changing the packaged default only changes which branch most users hit, not the logic itself.

## Alternatives Considered

### Native Wayland by default

Ship no `ozone-platform` flag, or `--ozone-platform=wayland`, and rely on Chromium's own per-session detection. Upstream #2506 was reverted as an accidental merge and #2601 was closed after a reporter-confirmed regression. This remains the eventual goal, not a rejected direction; the reopen triggers above describe what changes the answer.

### Per-compositor auto-detection in the app

Have the app decide the platform itself from `XDG_CURRENT_DESKTOP` or a compositor probe. Rejected because `--ozone-platform` is parsed before any Electron main process JavaScript runs, the same ordering constraint that blocks `electronCLIFlags`; app-level detection cannot act early enough without forking a second process purely to choose a flag.

### A dedicated config toggle

Expose `ozone-platform` as a `config.json` option. Rejected for the same ordering reason: config loads after the ozone backend is already fixed, so the option would silently do nothing. Documenting the CLI and `.desktop` override is more honest about the constraint than shipping a setting that cannot work.

## Related

- Upstream PR #2040 and #2139: added the x11 default (v2.7.4)
- Upstream PR #2509 / #2511: accidental flip to an invalid value and its hotfix
- Upstream PR #2506 / #2600: first removal attempt and its same-day revert
- Upstream PR #2601 and tracker #2508: Electron 42 retry, closed unmerged
- `app/startup/commandLine.js` (`#configureWayland`), [Troubleshooting](../../troubleshooting.md), [Configuration](../../configuration.md) (the `electronCLIFlags` constraint)
