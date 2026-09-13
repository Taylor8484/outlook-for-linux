---
id: 006-cli-argument-parsing-library
---

# ADR 006: CLI Argument Parsing Library Decision

:::note Inherited decision
This ADR was written in teams-for-linux, the project Outlook for Linux is based on, and still applies to the CLI and config parsing this app kept.
:::

## Status

✅ Implemented

## Context

Outlook for Linux uses `yargs` for CLI argument parsing. We evaluated whether to:
1. Add CLI-based action commands (`outlook-for-linux action <name>`)
2. Migrate to `commander.js` for better subcommand support
3. Keep current `yargs` implementation

### Requirements
- Support dozens of configuration options
- Parse config files and environment variables
- Accept a URL as a positional argument
- Low risk of breaking existing functionality

### Considered Options

**Option A: Add CLI Action Commands with yargs**
- Requires fragile pre-parsing before yargs initialization
- High risk of breaking positional URL handling
- Effort: 14-23 hours

**Option B: Migrate to commander.js**
- Better subcommand support
- Requires reimplementing config file and environment variable parsing
- Every existing option needs migration
- Effort: 6-8 hours
- Risk: Medium (regression testing needed)

**Option C: Keep yargs, Use an Alternative Command Mechanism**
- Trigger actions through a separate channel (global shortcuts, or a local IPC/HTTP endpoint if one is ever needed)
- No CLI parsing changes needed
- Risk: Low (isolated addition)

---

## Decision

**Stick with yargs. Do not add CLI action commands.**

Upstream, external action triggers were provided by an MQTT command channel. That integration was removed in Outlook for Linux, and no replacement action channel exists today; if one is needed, it should follow Option C rather than adding CLI subcommands.

### Rationale

1. **yargs is appropriate for current use case**
   - Config-heavy application
   - Built-in config file and environment variable support
   - No need for subcommands

2. **Avoid fragile bypass layer**
   - Pre-parsing arguments before yargs creates tight coupling
   - High risk of breaking positional argument handling
   - Difficult to maintain

3. **Better alternatives exist**
   - Global shortcuts already cover in-session actions
   - A dedicated local endpoint would be cleaner than CLI parsing tricks

4. **Future-proofing**
   - Can migrate to commander.js during a major version bump if multiple subcommands become necessary
   - Current architecture works well for current needs

---

## Consequences

### Positive
- ✅ No risk to existing functionality (config options, positional URL)
- ✅ No migration effort
- ✅ Built-in config/env parsing continues working

### Negative
- ⚠️ No native CLI subcommands (not needed currently)
- ⚠️ Future subcommand needs require migration or workarounds

### Neutral
- Option to migrate to commander.js remains open for future major versions
- Decision can be revisited if requirements change significantly

---

## References

- [yargs Documentation](https://yargs.js.org/)
- [commander.js Documentation](https://github.com/tj/commander.js)
