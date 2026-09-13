const { BrowserWindow, nativeImage, nativeTheme } = require("electron");
const path = require("node:path");
const windowStateKeeper = require("electron-window-state");
const {
  collectPartitionsToClear,
  clearStorageForPartitions,
} = require("../utils/storagePartitions");

class BrowserWindowManager {
  constructor(properties) {
    this.config = properties.config;
    this.iconChooser = properties.iconChooser;
    // Optional: only the startup clear reads it.
    this.profilesManager = properties.profilesManager ?? null;
    this.window = null;
  }

  async createWindow() {
    const windowState = windowStateKeeper({
      defaultWidth: 0,
      defaultHeight: 0,
    });

    if (this.config.clearStorageData) {
      // Every profile owns its own partition, so clearing only the startup one
      // left each profile's cookies and tokens on disk (#2866).
      await clearStorageForPartitions(
        collectPartitionsToClear(this.config.partition, this.profilesManager),
        this.config.clearStorageData,
        "on startup"
      );
    }

    this.window = this.createNewBrowserWindow(windowState);

    windowState.manage(this.window);

    if (process.env.E2E_TESTING !== 'true') {
      this.window.eval = globalThis.eval = function () { // eslint-disable-line no-eval
        throw new Error("Sorry, this app does not support window.eval().");
      };
    }

    return this.window;
  }

  /**
   * Converts an icon path to a nativeImage.
   * On Linux/KDE, the BrowserWindow icon must be a nativeImage for proper
   * display in the window list/panel (similar to tray icon fix in #2096).
   * @param {string} iconPath - Path to the icon file
   * @returns {Electron.NativeImage|undefined} The native image or undefined if no path
   */
  getIconImage(iconPath) {
    return iconPath ? nativeImage.createFromPath(iconPath) : undefined;
  }

  createNewBrowserWindow(windowState) {
    return new BrowserWindow({
      title: "Outlook for Linux",
      x: windowState.x,
      y: windowState.y,

      width: windowState.width,
      height: windowState.height,
      backgroundColor: nativeTheme.shouldUseDarkColors ? "#292929" : "#fff",

      show: false,
      autoHideMenuBar: this.config.menubar == "auto",
      icon: this.iconChooser ? this.getIconImage(this.iconChooser.getFile()) : undefined,
      frame: this.config.frame,

      webPreferences: {
        partition: this.config.partition,
        preload: path.join(__dirname, "..", "browser", "preload.js"),
        plugins: true,
        spellcheck: true,
        webviewTag: true,
        // SECURITY: contextIsolation is off so preload.js can replace
        // window.Notification in the page's own context; compensated by IPC
        // validation (app/security/ipcValidator.js).
        contextIsolation: false,
        nodeIntegration: false,   // Secure: preload scripts don't need this
        sandbox: false,           // Required for system API access
      },
    });
  }
}

module.exports = BrowserWindowManager;
