# Research Documentation

This directory holds research and analysis written while developing Outlook for Linux.

:::info Research Context
These documents record the analysis behind development decisions and give background for major features.
:::

## Contents

Everything listed here is work that has **not** fully shipped. When a piece of research is fully implemented or rejected, its decision moves to an [ADR](../adr/README.md) and the research document is deleted. Git history keeps the investigation.

### Open Work

No research is open right now. New investigations are added here while they are active. The [Development Roadmap](../plan/roadmap.md) lists the likely candidates.

### Inherited Research

Outlook for Linux is a fork of [teams-for-linux](https://github.com/IsmaelMartinez/teams-for-linux). Research for features that still exist in this fork is summarised in the kept ADRs, for example [ADR-013](../adr/013-pii-log-sanitization.md) (PII log sanitization), [ADR-021](../adr/021-webauthn-fido2-linux.md) (WebAuthn / FIDO2), [ADR-022](../adr/022-custom-notification-toast-scope.md) (notification toast), [ADR-024](../adr/024-smartcard-pkcs11-pin-dialog.md) (smartcard PIN dialog), [ADR-026](../adr/026-performance-audit-outcomes.md) (performance audit), [ADR-029](../adr/029-config-schema-single-source-of-truth.md) (config schema) and [ADR-031](../adr/031-ozone-platform-x11-default.md) (Ozone X11 default). Research for Teams-only features that were removed from this fork (such as calls, screen sharing, MQTT and quick chat) was not carried over. It is still available in the upstream repository.

## Document Lifecycle

Research documents follow this lifecycle:

1. **Active research**: record findings, analysis and recommendations
2. **Decision**: use the research to decide whether to implement or reject
3. **Archive**: once decided, move the outcome to the right place:
   - **Implemented features**: write an ADR if the decision is significant, update the feature docs, and delete the research
   - **Rejected features**: write or update an ADR with a short decision record, and delete the research
   - **Superseded research**: close it with a reference to the document that replaces it
4. **History**: git history keeps the full investigation

## Contributing Research

When adding a new research document:

1. **Name it clearly**: use a descriptive, kebab-case filename
2. **Include context**: give the date, scope and purpose of the analysis
3. **Link related documents**: cross-reference the relevant pages
4. **Update this index**: add an entry under Open Work
5. **End with outcomes**: include clear recommendations or decisions

## Related Documentation

- [Configuration Options](../../configuration.md): application configuration reference
- [IPC API](../ipc-api.md): developer integration documentation
- [Architecture Decision Records](../adr/README.md): formal architecture decisions
- [Development Roadmap](../plan/roadmap.md): future development plans
