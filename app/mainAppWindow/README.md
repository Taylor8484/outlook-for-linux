# Main App Window

Manages the primary BrowserWindow that hosts the Outlook web interface.

## Components

- **[index.js](index.js)**: Entry point and window lifecycle management
- **[browserWindowManager.js](browserWindowManager.js)**: Window creation, configuration, and event handling
- **[profileViewManager.js](profileViewManager.js)**: Per-profile `WebContentsView`s for multi-account mode
- **[senderProfileMap.js](senderProfileMap.js)**: Maps a `webContents` id to the profile that owns it

## Responsibilities

- Window state management (minimize, maximize, close)
- Web contents configuration and security settings
- Integration with Outlook web interface
- Loading Outlook URLs passed on the command line

## Command-Line URLs

`processArgs` picks the first `https` argument on an Outlook web app host
(`outlook.office.com`, `outlook.office365.com`, `outlook.cloud.microsoft`,
`outlook.live.com`, or a subdomain of one) and loads it into the window, both
at startup and when a second instance forwards its arguments through
`onAppSecondInstance`. There is no custom protocol handler.
