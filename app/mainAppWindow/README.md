# Main App Window

Manages the primary BrowserWindow that hosts the Outlook web interface.

## Components

- **[index.js](index.js)**: Entry point and window lifecycle management
- **[browserWindowManager.js](browserWindowManager.js)**: Window creation, configuration, and event handling
- **[profileViewManager.js](profileViewManager.js)**: Per-profile `WebContentsView`s for multi-account mode
- **[senderProfileMap.js](senderProfileMap.js)**: Maps a `webContents` id to the profile that owns it
- **[mailtoLink.js](mailtoLink.js)**: Converts `mailto:` links into Outlook compose deep links

## Responsibilities

- Window state management (minimize, maximize, close)
- Web contents configuration and security settings
- Integration with Outlook web interface
- Loading Outlook URLs passed on the command line

## Command-Line URLs and `mailto:` Links

`processArgs` picks the first `https` argument on an Outlook web app host
(`outlook.office.com`, `outlook.office365.com`, `outlook.cloud.microsoft`,
`outlook.live.com`, or a subdomain of one) and loads it into the window, both
at startup and when a second instance forwards its arguments through
`onAppSecondInstance`.

A `mailto:` argument is converted by [mailtoLink.js](mailtoLink.js) into an
Outlook compose deep link (`/mail/deeplink/compose` with `to`, `cc`, `bcc`,
`subject` and `body`) on the configured Outlook host, and opened in a separate
compose window that shares the main session partition. The Linux packages
declare `x-scheme-handler/mailto`, so the app can be chosen as the default
email handler (`xdg-mime default outlook-for-linux.desktop
x-scheme-handler/mailto`); it never makes itself the default. There is no other
custom protocol handler.
