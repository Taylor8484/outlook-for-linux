const { shell } = require("electron");
const buildProfilesMenu = require("./profilesMenu");

// Menu accelerators are registered on the window while the menu is attached,
// so they take precedence over the page. Outlook on the web binds Ctrl+R
// (reply), Ctrl+D (delete) and Ctrl+Q (mark as read), so Refresh, DevTools and
// Quit use browser-style keys instead of the Ctrl+letter chords teams-for-linux
// uses.
exports = module.exports = (Menus) => ({
  label: "Outlook for Linux",
  submenu: [
    {
      label: "Open",
      accelerator: "ctrl+O",
      click: () => Menus.open(),
    },
    {
      label: "Refresh",
      accelerator: "F5",
      click: () => Menus.reload(),
    },
    ...(process.env.APPIMAGE
      ? [
          {
            label: "Check for Updates",
            click: () => Menus.checkForUpdates(),
          },
        ]
      : []),
    {
      label: "Hide",
      accelerator: "ctrl+H",
      click: () => Menus.hide(),
    },
    {
      label: "Debug",
      submenu: [
        {
          label: "Open DevTools",
          accelerator: "F12",
          click: () => Menus.debug(),
        },
        {
          label: "Open GPU Info",
          click: () => Menus.showGpuInfo(),
        },
      ],
    },
    {
      type: "separator",
    },
    getSettingsMenu(Menus),
    getAppIconMenu(Menus),
    getPreferencesMenu(),
    getNotificationsMenu(Menus),
    ...(Menus.configGroup.startupConfig.multiAccount?.enabled
      ? [buildProfilesMenu(Menus)].filter(Boolean)
      : []),
    {
      type: "separator",
    },
    {
      label: "About",
      click: () => Menus.about(),
    },
    getHelpMenu(),
    {
      type: "separator",
    },
    {
      label: "Quit (Clear Storage)",
      click: () => Menus.quit(true),
    },
    {
      label: "Quit",
      accelerator: "ctrl+shift+Q",
      click: () => Menus.quit(),
    },
  ],
});

function getSettingsMenu(Menus) {
  return {
    label: "Settings",
    submenu: [
      // The startup warning names the deprecated options; this turns that into
      // something the user can act on in one click (ADR-025, #2913).
      //
      // Caught rather than left to float: app/index.js exits the process on any
      // non-network unhandled rejection, so a failing dialog here would take
      // the app down. The reason is not logged, since it can carry local paths.
      {
        label: "Show Updated Config…",
        click: () =>
          Menus.showMigratedConfig().catch(() =>
            console.error("[Config] Could not show the updated config", {
              failed: true,
            }),
          ),
      },
    ],
  };
}

function getAppIconMenu(Menus) {
  const hasCustomIcon = !!Menus.configGroup.startupConfig.appIcon?.trim();
  return {
    label: "App Icon",
    submenu: [
      {
        label: "Choose App Icon…",
        click: () => Menus.chooseAppIcon(),
      },
      {
        label: "Reset to default",
        enabled: hasCustomIcon,
        click: () => Menus.resetAppIcon(),
      },
    ],
  };
}

function getPreferencesMenu() {
  return {
    label: "Zoom",
    submenu: [
      { role: "resetZoom" },
      { role: "zoomIn" },
      { role: "zoomOut" },
      { role: "togglefullscreen" },
    ],
  };
}

function getNotificationsMenu(Menus) {
  return {
    label: "Notifications",
    submenu: [
      {
        label: "Disable All Notifications",
        type: "checkbox",
        checked: Menus.configGroup.startupConfig.disableNotifications,
        click: () => Menus.toggleDisableNotifications(),
      },
      {
        label: "Disable Notifications Sound",
        type: "checkbox",
        checked: Menus.configGroup.startupConfig.disableNotificationSound,
        click: () => Menus.toggleDisableNotificationSound(),
      },
      {
        label: "Disables Window Flash on New Notifications",
        type: "checkbox",
        checked: Menus.configGroup.startupConfig.disableNotificationWindowFlash,
        click: () => Menus.toggleDisableNotificationWindowFlash(),
      },
      {
        label: "Disable Badge Count",
        type: "checkbox",
        checked: Menus.configGroup.startupConfig.disableBadgeCount,
        click: () => Menus.toggleDisableBadgeCount(),
      },
      {
        label: "Urgency",
        submenu: [
          {
            label: "Low",
            type: "checkbox",
            checked:
              Menus.configGroup.startupConfig.defaultNotificationUrgency ===
              "low",
            click: () => Menus.setNotificationUrgency("low"),
          },
          {
            label: "Normal",
            type: "checkbox",
            checked:
              Menus.configGroup.startupConfig.defaultNotificationUrgency ===
              "normal",
            click: () => Menus.setNotificationUrgency("normal"),
          },
          {
            label: "Critical",
            type: "checkbox",
            checked:
              Menus.configGroup.startupConfig.defaultNotificationUrgency ===
              "critical",
            click: () => Menus.setNotificationUrgency("critical"),
          },
        ],
      },
    ],
  };
}

function getHelpMenu() {
  return {
    label: "Help",
    submenu: [
      {
        label: "Outlook on the Web Help",
        click: () =>
          shell.openExternal("https://support.microsoft.com/outlook"),
      },
      {
        label: "Github Project",
        click: () =>
          shell.openExternal(
            "https://github.com/Taylor8484/outlook-for-linux"
          ),
      },
    ],
  };
}
