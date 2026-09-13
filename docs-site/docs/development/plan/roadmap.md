# Development Roadmap

**Status:** Living document. Detailed per-issue and per-PR state lives in [GitHub Issues](https://github.com/Taylor8484/outlook-for-linux/issues), [Pull Requests](https://github.com/Taylor8484/outlook-for-linux/pulls), and the [ADRs](../adr/README.md). This page lists themes and likely follow-ups only.

Outlook for Linux started as a fork of [teams-for-linux](https://github.com/IsmaelMartinez/teams-for-linux). The first milestone removed the Teams-specific features (calls, screen sharing, MQTT, quick chat, meeting links and similar) and pointed the wrapper at Outlook on the web. The items below adapt the remaining wrapper features to how Outlook behaves.

---

## Principles

- **Validate first:** run a spike before building anything complex
- **Start simple:** ship the smallest useful version and add complexity only when needed
- **Linux-first:** prefer composable desktop integration over monolithic features
- **Incremental configuration:** new features use nested config names from day one ([ADR-025](../adr/025-config-option-naming-convention.md))

---

## Likely Follow-ups

- **Unread-count badge from the Outlook DOM**: the tray icon and unread badge were built around the Teams page. Outlook needs its own source for the count, such as the Inbox folder's unread counter in the navigation pane or the document title. The badge should update without polling the page too often.
- **`mailto:` handler**: register Outlook for Linux as a `mailto:` handler so that clicking an email link opens an Outlook compose window with the recipient, subject and body filled in.
- **Per-profile popup and auth wiring**: make sure pop-up windows and sign-in flows opened from a profile use that profile's session partition, not the default `persist:outlook-4-linux` partition. This covers the multi-account switcher ([ADR-020](../adr/020-multi-account-profile-switcher.md)), Intune SSO and SSO password pre-fill.
- **Outlook pop-out window allowlist**: Outlook opens pop-out windows for composing, reading messages and calendar events. Allow those same-origin pop-outs inside the app, and keep sending all other external links to the system browser.

---

## Related Documentation

- [Research Index](../research/README.md)
- [ADR Index](../adr/README.md)
- [Contributing Guide](../contributing.md)
- [Module Index](../module-index.md)
