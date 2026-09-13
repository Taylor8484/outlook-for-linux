# Startup Module

Handles Electron command line switches and initialization flags.

## commandLine.js

Manages command line switches that must be set during app startup. Some switches are applied before config loading, others after.

**Key responsibilities:**
- Autoplay policy so notification sounds play without a user gesture
- macOS performance switches (`media.macPerformanceMode`)
- Wayland/X11 display server detection and configuration
- GPU acceleration settings
- Proxy and authentication configuration
- User-defined Electron CLI flags from config
