# Development Documentation

This directory contains technical documentation for Outlook for Linux developers and contributors.

## Structure

### Active Development Docs
- **[security-architecture.md](security-architecture.md)** - Security architecture, threat model, and compensating controls
- **[module-index.md](module-index.md)** - Catalog of all application modules
- **[ipc-api.md](ipc-api.md)** - Inter-process communication overview
- **[ADR Index](adr/README.md)** - All architecture decision records
- **[Research Index](research/README.md)** - Feature research and investigations
- **[plan/roadmap.md](plan/roadmap.md)** - Development priorities and feature status

## For Contributors

When working on Outlook for Linux:

1. **Read the security architecture** to understand security trade-offs and requirements
2. **Check the module index** to find where functionality lives
3. **Check ADR documents** for architecture decisions and rationale
4. **Review the roadmap** for planned follow-ups
5. **Run `npm run lint` and `npm run test:unit`** before submitting PRs; CI runs the Playwright e2e suite

### Key Development Patterns

#### Authentication-Related Features
When working on sign-in, SSO or credential features:
- Collect secrets (PINs, passwords) in hardened main-process windows built on `app/_shared/securePrompt.js`, never inside the Outlook page
- Keep features opt-in behind nested config gates (for example `auth.webauthn.enabled`)
- Maintain PII-safe logging practices ([ADR-013](adr/013-pii-log-sanitization.md))

#### Session and Storage Guidelines
- Let Electron session partitions own cookies and storage; do not copy tokens out of the web app
- Scope per-profile state by partition when multi-account is enabled ([ADR-020](adr/020-multi-account-profile-switcher.md))
- Don't assume secure storage availability - always implement fallbacks

## Documentation Standards

Follow the project's Markdown Standards in [contributing.md](contributing.md#markdown-standards), including:
- Use Docusaurus admonitions for callouts (`:::note`, `:::tip`, `:::warning`, `:::danger`, `:::info`)
- Include table of contents with `<!-- toc -->`
- Use proper markdown standards and syntax highlighting

## Related Documentation

- [Configuration Options](../configuration.md) - User-facing configuration documentation
- [IPC API](ipc-api.md) - Inter-process communication reference
- [Contributing Guidelines](contributing.md) - General contribution guidelines
- [Architecture Decision Records](adr/README.md) - Technical decisions and rationale

### Testing

Outlook for Linux uses unit tests plus automated end-to-end smoke testing with Playwright to ensure application stability and prevent regressions.

#### Running Tests

```bash
# Run the unit suite first (fast, run before every commit)
npm run test:unit

# Run all E2E tests locally; CI runs this suite automatically on PRs
npm run test:e2e

# Run in debug mode
npx playwright test --debug
```

#### Testing Strategy

The project uses a multi-layered testing approach:
- **Unit Tests (node:test)**: Module-level tests in `tests/unit/`
- **E2E Tests (Playwright)**: Full application testing with real Electron runtime
- **Clean State Testing**: Each test runs with isolated temporary userData directory
- **Microsoft Authentication**: Tests validate redirect to login without requiring credentials

For comprehensive testing documentation, see:
- [Contributing Guide - Testing Section](contributing.md#testing)
- [ADR-009: Automated Testing Strategy](adr/009-automated-testing-strategy.md)
