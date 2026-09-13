---
title: "Architecture Decision Records"
sidebar_position: 1
type: reference
last_updated: 2026-09-13
tags: [adr, architecture, decisions]
---

# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records documenting significant technical decisions made in the Outlook for Linux project.

:::info Inherited decisions
Outlook for Linux is based on [teams-for-linux](https://github.com/IsmaelMartinez/teams-for-linux). The ADRs below were written in that project and carried over because they still govern code that this app kept. Issue and PR numbers inside them refer to the upstream teams-for-linux repository. ADRs about features that were removed in the Outlook conversion (screen sharing, MQTT, quick chat, Graph API, token cache, cross-distro Docker testing, upstream bots and dashboards) were not carried over; their numbers are intentionally left as gaps.
:::

## What are ADRs?

Architecture Decision Records capture important architectural decisions along with their context and consequences. They help:

- **Document the "why"** behind technical choices
- **Preserve context** for future maintainers
- **Enable better decisions** by learning from past choices
- **Onboard contributors** faster by explaining rationale

## Status Overview

| ADR | Title | Status | Date | Version |
|-----|-------|--------|------|---------|
| [004](004-agents-md-standard-investigation.md) | agents.md Standard Investigation | ❌ Rejected | 2025-11-16 | N/A |
| [006](006-cli-argument-parsing-library.md) | CLI Argument Parsing Library | ✅ Implemented | 2025-11-19 | N/A |
| [009](009-automated-testing-strategy.md) | Automated Testing Strategy | ✅ Implemented | 2025-12-13 | v2.7.4+ |
| [011](011-appimage-update-info.md) | AppImage Update Info for Third-Party Managers | 🔄 Superseded | 2026-01-25 | v2.7.1 |
| [012](012-intune-sso-broker-compatibility.md) | Intune SSO Broker Compatibility | ✅ Implemented | 2026-01-25 | v2.7.1 |
| [013](013-pii-log-sanitization.md) | PII Log Sanitization | ✅ Implemented | 2026-01-31 | v2.7.3 |
| [020](020-multi-account-profile-switcher.md) | Multi-Account Profile Switcher | ✅ Implemented | 2026-04-16 | v2.9.0+ |
| [021](021-webauthn-fido2-linux.md) | WebAuthn / FIDO2 Hardware Security Keys on Linux | ✅ Implemented | 2026-04-21 | v2.10.0 |
| [022](022-custom-notification-toast-scope.md) | Custom Notification Toast Scope | ✅ Implemented | 2025-11-16 | v2.6.16 |
| [023](023-release-automation-tooling.md) | Release Automation Tooling | ✅ Implemented | 2026-03-13 | N/A |
| [024](024-smartcard-pkcs11-pin-dialog.md) | Smartcard PKCS#11 PIN Dialog | ✅ Implemented | 2026-06-09 | v2.14.0 |
| [025](025-config-option-naming-convention.md) | Configuration Option Naming Convention | ✅ Accepted | 2026-08-11 | N/A |
| [026](026-performance-audit-outcomes.md) | Performance Audit Outcomes | ✅ Accepted | 2026-08-11 | N/A |
| [028](028-third-party-idp-otc-prefill.md) | One-Time-Code Pre-fill on Third-Party IdPs | ❌ Rejected | 2026-08-19 | N/A |
| [029](029-config-schema-single-source-of-truth.md) | Configuration Schema as Single Source of Truth | ✅ Accepted | 2026-09-05 | v2.12.0+ |
| [031](031-ozone-platform-x11-default.md) | Keep the `--ozone-platform=x11` Default on Wayland | ✅ Accepted | 2026-09-05 | N/A |

Versions refer to the teams-for-linux release in which the decision shipped.

**Legend:**
- ✅ **Implemented** - Decision accepted and code in production
- ✅ **Accepted** - Decision accepted, implementation pending or partial
- ❌ **Rejected** - Decision evaluated and declined with rationale
- 🚧 **Proposed** - Under review, not yet accepted
- 🔄 **Superseded** - Replaced by a newer decision

## By Topic

### Authentication & Security

| ADR | Title | Summary |
|-----|-------|---------|
| [012](012-intune-sso-broker-compatibility.md) | Intune SSO Broker Compatibility | Direct D-Bus invocation for Microsoft Identity Broker version compatibility |
| [013](013-pii-log-sanitization.md) | PII Log Sanitization | Custom regex sanitizer to redact sensitive data from logs |
| [021](021-webauthn-fido2-linux.md) | WebAuthn / FIDO2 Hardware Security Keys | FIDO2 hardware key support on Linux via fido2-tools interception |
| [024](024-smartcard-pkcs11-pin-dialog.md) | Smartcard PKCS#11 PIN Dialog | PIN collected in a hardened main-process window, never injected into the web app page |
| [028](028-third-party-idp-otc-prefill.md) | One-Time-Code Pre-fill on Third-Party IdPs | Rejected DOM-based OTC pre-fill for Okta and similar; Electron cannot host a password-manager extension, so contract-backed factors are the answer |

**Key Outcomes:**
- Support for Microsoft Identity Broker versions ≤ 2.0.1 and > 2.0.1
- PII sanitization with zero dependencies, UUIDs correlatable for debugging
- Hardware security keys and smartcards usable on Linux, with secrets kept out of the web app renderer

### Linux Desktop & Display Server

| ADR | Title | Summary |
|-----|-------|---------|
| [031](031-ozone-platform-x11-default.md) | Keep the `--ozone-platform=x11` Default on Wayland | Ship `--ozone-platform=x11` as the default on deb, rpm and AppImage after upstream attempts to remove it regressed, with concrete reopen triggers recorded |

**Key Outcomes:**
- Predictable default rendering path across the `.desktop`-launched formats
- `electronCLIFlags` cannot override the flag; only a genuine command-line or `.desktop` override can

### Testing & Quality

| ADR | Title | Summary |
|-----|-------|---------|
| [009](009-automated-testing-strategy.md) | Automated Testing Strategy | Smoke testing with Playwright; comprehensive testing impractical due to MS authentication constraints |

**Key Outcomes:**
- Playwright E2E smoke tests validate app launch and login redirect
- Tests run in isolated temp directories for clean state
- Manual testing remains primary quality gate for feature changes

### Performance

| ADR | Title | Summary |
|-----|-------|---------|
| [026](026-performance-audit-outcomes.md) | Performance Audit Outcomes | Outcomes for the performance audit findings that still apply, timeout-budget offline detection, no instrumentation module |

**Key Outcomes:**
- Offline detection bounded by a 20 s budget that assumes online on exhaustion
- No performance instrumentation, deliberately

### Documentation & Standards

| ADR | Title | Summary |
|-----|-------|---------|
| [004](004-agents-md-standard-investigation.md) | agents.md Standard Investigation | Investigated and rejected agents.md standard in favor of tool-specific standards (CLAUDE.md, copilot-instructions.md) |
| [006](006-cli-argument-parsing-library.md) | CLI Argument Parsing Library | Keep yargs for config parsing rather than adding CLI subcommands |
| [025](025-config-option-naming-convention.md) | Configuration Option Naming Convention | Nesting criteria, positive naming, and the resolved flat-to-nested rename mapping for configuration options |
| [029](029-config-schema-single-source-of-truth.md) | Configuration Schema as Single Source of Truth | One-schema-three-consumers thesis: `app/config/options.js` feeds the generated docs, the docs explorer, and startup validation |

**Key Outcomes:**
- Centralized markdown standards in contributing.md
- Maintained tool-specific official standards
- Configuration option naming convention and rename mapping owned by ADR-025
- Configuration schema treated as single source of truth for generated docs, the docs explorer, and startup validation, owned by ADR-029

### Release Process & Automation

| ADR | Title | Summary |
|-----|-------|---------|
| [023](023-release-automation-tooling.md) | Release Automation Tooling | Adopt release-please for conventional-commit driven versioning, rejecting release-it and Beads |

**Key Outcomes:**
- Decoupled merging from releasing
- Changelog derived directly from conventional commits

### UI Features

| ADR | Title | Summary |
|-----|-------|---------|
| [020](020-multi-account-profile-switcher.md) | Multi-Account Profile Switcher | WebContentsView-based profile switching with feature-flag gating |
| [022](022-custom-notification-toast-scope.md) | Custom Notification Toast Scope | Keep the opt-in custom toast, drop the Phase 2 notification centre as unverifiable |

**Key Outcomes:**
- Multiple accounts in one window with warm sessions, opt-in via `multiAccount.enabled`
- Daemon-independent notification toast, opt-in via `notificationMethod: "custom"`

### Distribution & Packaging

| ADR | Title | Summary |
|-----|-------|---------|
| [011](011-appimage-update-info.md) | AppImage Update Info | Post-processing AppImages with appimagetool, superseded by electron-updater auto-update |

**Key Outcomes:**
- AppImage builds update in-app via electron-updater

## Creating New ADRs

### When to Create an ADR

Create an ADR for decisions that:
- Have significant architectural impact
- Affect multiple modules or systems
- Involve trade-offs between alternatives
- Need to be explained to future contributors
- Change existing patterns or conventions

### ADR Template

Use this template for new ADRs (save as `docs-site/docs/development/adr/0XX-your-title.md`, continuing from the highest existing number, and add it to `docs-site/sidebars.ts`):

```markdown
---
id: 0XX-your-title
---

# ADR 0XX: [Title - Short Noun Phrase]

## Status

[Proposed | Accepted | Implemented | Rejected | Superseded by ADR-XXX]

## Context

What is the issue we're trying to address? Include:
- Problem description
- Why this needs a decision now
- Technical background and constraints
- What we investigated or researched

## Decision

What did we decide to do? Be specific:
- Exact approach chosen
- Implementation strategy
- Key parameters or configurations

## Consequences

What are the impacts of this decision?

### Positive
- Benefits gained
- Problems solved
- Improvements delivered

### Negative
- Trade-offs accepted
- Limitations introduced
- Future constraints

### Neutral
- Implementation notes
- Maintenance considerations
- Migration requirements (if applicable)

## Alternatives Considered

What other options did we evaluate and why were they not chosen?

### Option 1: [Name]
- Description
- Pros
- Cons
- **Why rejected**: [Specific reason]

### Option 2: [Name]
- ...

## Related
- ADR-XXX: [Related decision]
- Issue #XXX
- PR #XXX
```

### ADR Naming Conventions

- **Number**: Sequential (032, 033, ...)
- **Title**: Short, descriptive noun phrase
- **Filename**: `0XX-lowercase-with-hyphens.md`

**Examples:**
- ✅ `013-pii-log-sanitization.md`
- ✅ `021-webauthn-fido2-linux.md`
- ❌ `032-login-bug-fix.md` (too vague)
- ❌ `032-ImplementLoginFix.md` (wrong case)

### ADR Workflow

1. **Create draft ADR** with "Proposed" status
2. **Discuss with maintainers** (GitHub issue or PR)
3. **Update status** to "Accepted" or "Rejected" based on outcome
4. **Implement** (if accepted)
5. **Update status** to "Implemented" when deployed
6. **Add to this index** in the appropriate topic category

## ADR Maintenance

### Updating Existing ADRs

- **Status changes**: Update when implementation completes or decision is superseded
- **Consequences**: Add learned lessons or unexpected outcomes after implementation
- **Version notes**: Add when decision affects specific releases

### Superseding ADRs

When replacing an old decision:
1. Create new ADR documenting the new approach
2. Update old ADR status to: `Superseded by ADR-XXX`
3. Link new ADR to old one in "Related" section
4. Explain in new ADR why the old approach was replaced

### Example Supersession

```markdown
## Status

~~Accepted~~ → Superseded by [ADR-032](032-new-approach.md)

**Note**: This approach was replaced in October 2026 due to [reason].
See ADR-032 for the current implementation.
```

## Best Practices

### Writing Good ADRs

✅ **Do:**
- Write for future readers who don't have your context
- Explain the "why" more than the "what"
- Document alternatives considered
- Include specific examples and code references
- Update ADR when you learn something new post-implementation

❌ **Don't:**
- Write implementation documentation (that belongs in module READMEs)
- Skip the consequences section
- Forget to add links to related issues/PRs
- Leave status outdated (update when implemented)

### ADR Size Guidelines

- **Minimum**: ~200 words (if shorter, might not need an ADR)
- **Typical**: 500-1000 words
- **Maximum**: No hard limit, but consider splitting if >2000 words

### Code References

When referencing code in ADRs:

```markdown
**Implementation**: `app/utils/logSanitizer.js`
**Configuration**: See `config.json` → `auth.webauthn.enabled`
**IPC Channel**: `webauthn:create`
```

## ADR Statistics

- **Total ADRs**: 16
- **Implemented**: 9
- **Accepted**: 4
- **Proposed**: 0
- **Rejected**: 2
- **Superseded**: 1
- **Topics covered**: 8 (Authentication & Security, Linux Desktop & Display Server, Testing & Quality, Performance, Documentation & Standards, Release Process & Automation, UI Features, Distribution & Packaging)

## Related Documentation

- **Contributing Guide**: [Development Guidelines](../contributing.md)
- **Module Documentation**: [Module Index](../module-index.md)
- **Research Documents**: [Research Index](../research/README.md)
- **Development Roadmap**: [Future Plans](../plan/roadmap.md)
- **Configuration Reference**: [Configuration Options](../../configuration.md)

## Questions?

- **"Should I create an ADR for this?"** → If you're asking, probably yes. When in doubt, create one.
- **"Where do implementation details go?"** → Module READMEs. ADRs explain "why", READMEs explain "how".
- **"Can I update an old ADR?"** → Yes! Add consequences learned or update status. Don't rewrite history, but do add learnings.
- **"What if my decision was wrong?"** → Document it! Create a new ADR explaining why you're changing course. This is valuable learning.

## External Resources

- [Architecture Decision Records (ADR) Overview](https://adr.github.io/)
- [When to Write an ADR](https://engineering.atspotify.com/2020/04/when-should-i-write-an-architecture-decision-record/)
- [ADR Template Collection](https://github.com/joelparkerhenderson/architecture-decision-record)
