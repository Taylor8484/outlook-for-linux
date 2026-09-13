# Browser Module

Handles browser-side code injection and communication with the Outlook web interface.

## Structure

- **[notifications/](notifications/)**: Bridges main-process notification click/close events back to the page's notification objects
- **[tools/](tools/)**: Client-side scripts injected into Outlook interface
- **[preload.js](preload.js)**: Preload script for secure IPC communication

## Key Features

- Notification count tracking and tray icon updates
- Browser API patching for enhanced functionality
- Keyboard shortcuts and zoom controls
