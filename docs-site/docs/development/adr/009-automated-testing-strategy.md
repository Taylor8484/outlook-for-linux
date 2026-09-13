---
id: 009-automated-testing-strategy
---

# ADR 009: Automated Testing Strategy

:::note Inherited decision
This ADR was written in teams-for-linux, the project Outlook for Linux is based on. The constraints apply equally to wrapping Outlook on the web.
:::

## Status

✅ Implemented

## Context

The application required a testing strategy to ensure stability and prevent regressions. As an Electron application wrapping a Microsoft 365 web app (originally Microsoft Teams, now Outlook), several constraints affected the testing approach:

**Key Constraints:**

1. **Microsoft Authentication Wall**: Core application functionality requires authentication through Microsoft's login system, which cannot be mocked or bypassed
2. **Third-Party DOM Dependency**: The web app's interface is controlled by Microsoft and can change without notice
3. **Multi-Platform Support**: Linux (X11/Wayland) primarily, with macOS and Windows builds possible
4. **Limited Development Resources**: Volunteer-maintained open source project with limited capacity for test maintenance

**Investigation Date:** 2025 (Research Phase 1)

### Options Evaluated

1. **Comprehensive E2E Testing** - Full authenticated test suite covering all features
2. **Smoke Testing Only** - Basic launch validation without authentication
3. **Unit/Integration Tests** - Module-level testing with mocked dependencies
4. **No Automated Testing** - Manual testing only

## Decision

**Accept smoke testing as the primary automated testing strategy.** Comprehensive automated testing is not practical for this codebase due to Microsoft authentication constraints.

### Implementation

- **Framework**: Playwright with Electron support
- **Scope**: Smoke tests validating application launch and proper redirect to Microsoft login
- **Location**: `tests/e2e/smoke.spec.js` (plus feature-gate specs in `tests/e2e/`)
- **Execution**: `npm run test:e2e`

### Test Isolation

Each test creates a unique temporary userData directory via `E2E_USER_DATA_DIR` environment variable, ensuring:

- Clean state (no cookies, cache, or storage)
- No interference between test runs
- Predictable test behavior

### Current Test Coverage

```javascript
// Validates:
// 1. Application launches successfully
// 2. Main window opens
// 3. Redirects to the configured web app or Microsoft login (login.microsoftonline.com)
```

## Consequences

### Positive

- ✅ **Validates core launch flow** - Catches configuration and startup regressions
- ✅ **Fast execution** - Tests complete in seconds, suitable for CI
- ✅ **No authentication overhead** - No need to manage test credentials or tokens
- ✅ **Cross-platform compatible** - Same tests work on Linux, macOS, Windows
- ✅ **Low maintenance** - Simple tests are less likely to break from web app UI changes

### Negative

- ⚠️ **Limited coverage** - Post-authentication functionality not tested automatically
- ⚠️ **Manual testing required** - Features like notifications, the unread badge and SSO need manual verification
- ⚠️ **No regression detection** - Feature bugs won't be caught by automated tests

### Neutral

- Manual testing remains the primary quality gate for feature changes
- Contributors should run `npm run test:e2e` before submitting PRs
- Feature-specific testing documented in PR descriptions and testing checklists

## Alternatives Considered

### Option 1: Comprehensive Authenticated E2E Testing

Using Playwright's storage state to persist authentication:

```javascript
// Save authenticated state after manual login
await window.context().storageState({ path: 'tests/.auth/user.json' });

// Reuse in tests
use: { storageState: 'tests/.auth/user.json' }
```

**Why rejected:**

- Token expiration requires periodic manual re-authentication
- Test account management adds operational complexity
- Tests become flaky when authentication expires
- Violates "minimal maintenance" goal for volunteer project

An opt-in authenticated suite exists (`npm run test:authenticated`) for local use, but it is not a CI gate.

### Option 2: Unit/Integration Tests with Mocked Authentication

Mock Microsoft web app interfaces for isolated module testing:

```javascript
vi.mock('electron', () => ({ /* mocked APIs */ }));
```

**Why rejected as the primary strategy:**

- High initial investment for setup
- Mocks can become stale when APIs change
- Doesn't validate real user experience
- Would need significant refactoring of the codebase

### Option 3: No Automated Testing

Rely entirely on manual testing and community feedback.

**Why rejected:**

- Too easy to introduce regressions
- No CI gate for obvious launch failures
- Smoke tests provide valuable minimum safety net

## Future Considerations

### When to Revisit

- If Microsoft provides stable testing APIs or sandbox environment
- If volunteer capacity significantly increases
- If critical regressions repeatedly slip through smoke tests

### Potential Expansions

Low-effort additions that do not require authentication (several now exist under `tests/unit/`):

1. **Configuration validation tests** - Validate config parsing without authentication
2. **IPC security tests** - Verify channel allowlist enforcement
3. **Module unit tests** - Test isolated utilities like `spellCheckProvider`, `cacheManager`

## Related

- [Contributing Guide - Testing Section](../contributing.md#testing)
- Playwright Configuration: `playwright.config.js`
- Test Location: `tests/e2e/`, `tests/unit/`

## References

- [Playwright Electron API](https://playwright.dev/docs/api/class-electron)
- [Electron Testing Guide](https://www.electronjs.org/docs/latest/tutorial/automated-testing)
