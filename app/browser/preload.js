const { ipcRenderer } = require("electron");

// Note: IPC validation handled by main process, no need for duplicate validation here
globalThis.electronAPI = {
  send: (channel, ...args) => {
    return ipcRenderer.send(channel, ...args);
  },

  getConfig: () => ipcRenderer.invoke("get-config"),

  showNotification: (options) => {
    if (!options || typeof options !== 'object') {
      return Promise.reject(new Error('Invalid notification options'));
    }
    return ipcRenderer.invoke("show-notification", options);
  },
  playNotificationSound: (options) => {
    if (options && typeof options !== 'object') {
      return Promise.reject(new Error('Invalid sound options'));
    }
    return ipcRenderer.invoke("play-notification-sound", options);
  },
  sendNotificationToast: (data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid notification toast data');
    }
    ipcRenderer.send("notification-show-toast", data);
  },

  setBadgeCount: (count) => {
    if (typeof count !== 'number' || count < 0 || count > 9999) {
      console.error('Invalid badge count:', count);
      return Promise.reject(new Error('Invalid badge count'));
    }
    return ipcRenderer.invoke("set-badge-count", count);
  },

  updateTray: (icon, flash) => {
    return ipcRenderer.send("tray-update", { icon, flash });
  },

  getZoomLevel: (partition) => {
    if (typeof partition !== 'string' || partition.length > 100) {
      return Promise.reject(new Error('Invalid partition'));
    }
    return ipcRenderer.invoke("get-zoom-level", partition);
  },
  saveZoomLevel: (data) => {
    if (!data || typeof data !== 'object' || typeof data.level !== 'number') {
      return Promise.reject(new Error('Invalid zoom data'));
    }
    return ipcRenderer.invoke("save-zoom-level", data);
  },

  sessionType: process.env.XDG_SESSION_TYPE || "x11",
};

// Config is fetched asynchronously; the Notification override below reads it via closure
let notificationConfig = null;
ipcRenderer.invoke("get-config").then((config) => {
  notificationConfig = config;
  console.debug("Preload: Config loaded for notifications:", {
    notificationMethod: config?.notificationMethod,
    disableNotifications: config?.disableNotifications
  });
}).catch((err) => {
  console.error("Preload: Failed to load config for notifications:", err);
});

// Create a Notification-like stub so Teams can manage lifecycle without errors.
// Without addEventListener/close/dispatchEvent, Teams' internal state machine
// breaks after the first notification, causing subsequent ones to stop firing.
function createNotificationStub() {
  const stub = {
    onclick: null,
    onclose: null,
    onerror: null,
    onshow: null,
    close() { if (this.onclose) this.onclose(); },
    addEventListener(type, listener) {
      if (type === 'click') this.onclick = listener;
      else if (type === 'close') this.onclose = listener;
      else if (type === 'show') this.onshow = listener;
      else if (type === 'error') this.onerror = listener;
    },
    removeEventListener(type, listener) {
      if (type === 'click' && (!listener || this.onclick === listener)) this.onclick = null;
      else if (type === 'close' && (!listener || this.onclose === listener)) this.onclose = null;
      else if (type === 'show' && (!listener || this.onshow === listener)) this.onshow = null;
      else if (type === 'error' && (!listener || this.onerror === listener)) this.onerror = null;
    },
    dispatchEvent() { return true; },
  };
  // Fire the show event asynchronously like a real Notification
  setTimeout(() => { if (stub.onshow) stub.onshow(); }, 0);
  return stub;
}

function playNotificationSound(notifSound) {
  // Skip renderer-side sound for "electron" method — the main process
  // notification service already plays the sound before showing the notification.
  const method = notificationConfig?.notificationMethod || "web";
  if (method === "electron") {
    return;
  }
  if (globalThis.electronAPI?.playNotificationSound) {
    try {
      console.debug("Requesting application to play sound");
      globalThis.electronAPI.playNotificationSound(notifSound);
    } catch (e) {
      console.debug("playNotificationSound failed", e);
    }
  }
}

function createWebNotification(classicNotification, title, options) {
  const notifSound = {
    type: options.type,
    audio: "default",
    title: title,
    body: options.body,
  };
  playNotificationSound(notifSound);

  // Return actual native notification object (critical for Teams to manage lifecycle)
  console.debug("Continues to default notification workflow");
  if (classicNotification) {
    try {
      return new classicNotification(title, options);
    } catch (err) {
      console.debug("Could not create native notification:", err);
      return null;
    }
  }
  return null;
}

// Bridges the main process's notification lifecycle onto the stubs above: close,
// so Teams knows when the system dismissed a notification, and click, so Teams'
// own handler can open the conversation the notification came from (issue #2768).
// Two ipcRenderer listeners for the whole renderer, not a pair per notification.
const NotificationBridge = require("./notifications/notificationBridge");
const notificationBridge = new NotificationBridge(ipcRenderer);

function createElectronNotification(options) {
  const notificationId = crypto.randomUUID();
  const stub = createNotificationStub();
  if (globalThis.electronAPI?.showNotification) {
    // Register before invoking: main can emit click or close as soon as it has
    // shown the notification. stub.close() from Teams and the notification-closed
    // IPC both route through the bridge, so whichever lands first fires onclose
    // exactly once. Without electronAPI the stub keeps its own close().
    notificationBridge.register(notificationId, stub);
    stub.close = () => notificationBridge.close(notificationId);
    globalThis.electronAPI
      .showNotification({ ...options, notificationId })
      .catch((e) => {
        console.debug("showNotification failed", e);
      });
  }
  return stub;
}

function createCustomNotification(title, options) {
  const notificationData = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    title: title,
    body: options.body || '',
    icon: options.icon,
  };

  const notifSound = {
    type: options.type,
    audio: "default",
    title: title,
    body: options.body,
  };
  playNotificationSound(notifSound);

  try {
    if (globalThis.electronAPI?.sendNotificationToast) {
      globalThis.electronAPI.sendNotificationToast(notificationData);
    } else {
      console.warn("sendNotificationToast API not available");
    }
  } catch (e) {
    console.error("Failed to send custom notification:", e);
  }

  return createNotificationStub();
}

// Override window.Notification immediately before Teams loads
// Using factory function pattern instead of class to avoid "return in constructor" anti-pattern
(function() {
  const ICON_BASE64 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFMUlEQVR4nO2bXWwUVRTHixp9IuATH4vt7qwGkeKD+JkYIYoYY8SPCBgNGF6UByNv8qBht22qxI+Hrh/dgdqGD5VWWwolSFOCKIQQWmhSqlSbtpbdLh+ttHTpzNyZxeO5Lbs7M7vduVtmu7PdOcnJTndnmvv/3XPPPffOTEGBbbbZZts0GsfDHKdfeIbjpQ9cvFTt4sVzLr9I8O8+7ltSnO32mWocLxQ6eWkNituGQutRcA8ew+Qufp/tNk/JVnjgLvcOstTFk7Uo1Mv5xSYUeyW12KTenG0thra4Cma7d8rL3ZXCRhRbgUJPYs8JUxBrfQD3VY0tRJGrsGFbOL+0G4//QLE3TRJrMQAAs9y89CqG7+cotgV7djCDQq0HAHu2PAuCrQOATkd5DQAjoMMGYAOwAWQVgPOr8HWHJ9CWYW+cV3bJZU0AvjA4vMHMO0LIawALPcEOiwIYlbFx10xxb1DMOQCcSUnQURJ4EQH8m38APHAHjm+vwxu4qRvz/6m/m5EAuO09c1Dk/sQeD4RR8Dr0UEYAPLBDgtV1BDYdJvDOIQKragm4pwqgUjg2FfELPAOPYC/3JhF/YX5paAk9x3QAy6ol8LXJMHBdgUgkovGeawpsPy3Dg1XpAcAkSFDIxnTEo8gN6GNJxB+gURE9z1QAbzQS6B9JFK73rqHIeHSwAwhHG3h4flmoKJXw+yv+vgcTXUWSOT6C4rfi+n6W+nzTAKw/QGBUTC1c7VfCCrxQlx6A6NhF31JQB3fq24ohX4giziQRfxl9ZTJgpgB4cg+BoRvanidyBH7pUeCTU/J42P/ar4CsaCH0DSvjQyY9ADFR5xaUhpbHQh4FjgvVT23eYGuqqDEFQHOvVjwdBi//nHje202JoHadlw0BuL4Z60JxN5LM2zIKLMfPjydCPOF330OezrsnE28KgJd+kjSCRoQIPLdv8vH9egMBSY6fL+LxU3sN80HzPM8lJzbwCFNJi9Ue+qZUwk0DsO9PWQOg5KRxj/rbtddUtBpeE6sDHCXBtdjbV1OI715UenEZi3hTAAyMxkN6GHt/6XfGY5r2OFFFQfvlCDMAaoWf9t+LQvmJSk4zxTUVefrmsoq/bQDPYqire/JQt8KU1am3heLgCCZHg2SYtBLErL8aG92JMIbx+EP9FJdxAG8d1AL47LRx+Ee9pkM7DJ6vTZkHMrYjdFsA3m/RAth6nB3Al2e0ANY15iCA945oAXz0OzsAmvjU177WkIMAaK+pRfiMs3nMa3Wzx4ofcxDA47sJKCoRJy6yJ8G/huJJMCxFYPHO9JNg1gFQpwsbdfnLUNQkFE+0TDa4xroAfLqxvIehtG3pU9LNHdYF8AQuhAQSF0MXPJubJ4+CbSe0wAZxbcBQPFkXAPWvz2pF0fq+/JR246O4euI8/YqQAmHIGdYGQIWev5q45qe9e+wfBX7DMU7LZP3vx/F7xm0yawOg/hjOCBcG2TdEWrEUfriGbcbICQDUH91F4GB36i0x5VaiLGbYCMk5AFF/E9cI9V0yhG6tFOm4D4wosLdThjX16f2vnASg9iWYHwyKHEM39daYznPixoh9c3S6bo97A/utCWA6HpBA8XTf0ZIAuHx/RMYGYD8omV0AZXkNIPawNC9+4eKlo+hD+QUgieXX4/KMRl+Y4HjhabdffHfGvzDBann1ykw65qwSityV0is4fDwuv9iAn72pACC8H7Ld5oxbUQ3MdVeKK2lecfmlGoyWdhQuc/S1OZ4w3+2dWQbp3+y0zTbbTLH/AaEkPGNeagP/AAAAAElFTkSuQmCC";

  const classicNotification = globalThis.Notification;

  // Factory function that creates notification objects (avoids "return in constructor" issue)
  function CustomNotification(title, options) {
    // Use config from closure scope (will be null initially, populated async)
    if (notificationConfig?.disableNotifications) {
      // Return dummy object to avoid Teams errors
      return { onclick: null, onclose: null, onerror: null };
    }

    options = options || {};
    options.icon = options.icon || ICON_BASE64;
    options.title = options.title || title;
    options.type = options.type || "new-message";
    // Default Ubuntu Unity DE auto-closes. Users on GNOME and similar can opt
    // into persistent notifications via `notifications.timeoutType: "never"`
    // (issue #2411). Mirrors Electron's Notification timeoutType.
    options.timeoutType =
      notificationConfig?.notifications?.timeoutType === "never"
        ? "never"
        : "default";
    options.requireInteraction = options.timeoutType === "never";

    // Default to "web" if config not loaded yet
    const method = notificationConfig?.notificationMethod || "web";

    if (method === "custom") {
      return createCustomNotification(title, options);
    }

    if (method === "web") {
      const notification = createWebNotification(classicNotification, title, options);
      return notification || { onclick: null, onclose: null, onerror: null };
    }

    return createElectronNotification(options);
  }

  CustomNotification.requestPermission = async function() {
    return "granted";
  };

  Object.defineProperty(CustomNotification, 'permission', {
    get: function() {
      return "granted";
    }
  });

  globalThis.Notification = CustomNotification;
  console.debug("Preload: CustomNotification factory initialized");
})();

document.addEventListener('DOMContentLoaded', async () => {
  console.debug("Preload: DOMContentLoaded, initializing browser modules...");
  try {
    const config = await ipcRenderer.invoke("get-config");
    console.debug("Preload: Got config:", {
      trayIconEnabled: config?.trayIconEnabled,
      useMutationTitleLogic: config?.useMutationTitleLogic
    });
    
    if (config.useMutationTitleLogic) {
      const mutationTitle = require("./tools/mutationTitle");
      mutationTitle.init(config);
    }
    
    // NOTE: the unread-count event is handled by trayIconRenderer.js; a second
    // listener here previously caused duplicate IPC traffic and rendering.

    const modules = [
      { name: "zoom", path: "./tools/zoom" },
      { name: "shortcuts", path: "./tools/shortcuts" },
      { name: "emulatePlatform", path: "./tools/emulatePlatform" },
      { name: "webauthnOverride", path: "./tools/webauthnOverride" },
      { name: "trayIconRenderer", path: "./tools/trayIconRenderer" },
    ];

    // CRITICAL: These modules need ipcRenderer for IPC communication (see CLAUDE.md)
    const modulesRequiringIpc = new Set(["trayIconRenderer", "webauthnOverride"]);

    let successCount = 0;
    for (const module of modules) {
      try {
        const moduleInstance = require(module.path);
        if (modulesRequiringIpc.has(module.name)) {
          moduleInstance.init(config, ipcRenderer);
        } else {
          moduleInstance.init(config);
        }
        successCount++;
      } catch (err) {
        console.error(`Preload: Failed to load ${module.name}:`, err.message);
      }
    }
    
    console.info(`Preload: ${successCount}/${modules.length} browser modules initialized successfully`);

    // Listen for config changes from the main process (e.g., when menu toggles are clicked)
    ipcRenderer.on("config-changed", (_event, configChanges) => {
      for (const [key, value] of Object.entries(configChanges)) {
        config[key] = value;
      }
    });

  } catch (error) {
    console.error("Preload: Failed to initialize browser modules:", error);
  }
});

// Forward unhandled promise rejections and window errors to main for diagnostics.
// Plain objects without a `.message` (and `undefined` rejections) previously stringified to
// the literals "[object Object]" / "undefined", which discarded all diagnostic content.
function serializeRejectionReason(reason) {
  // The whole body is wrapped in try/catch so a throwing `reason.message`
  // getter (or any other unexpected exception) degrades to a sentinel
  // string instead of propagating to the outer handler and dropping the
  // whole rejection payload.
  try {
    if (reason === undefined) return "<undefined>";
    if (reason === null) return "<null>";
    if (typeof reason === "string") return reason;
    if (typeof reason !== "object") return String(reason);
    if (typeof reason.message === "string" && reason.message.length > 0) return reason.message;
    const seen = new WeakSet();
    return JSON.stringify(reason, (_key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return "[Circular]";
        seen.add(value);
      }
      return value;
    }) ?? "[unserializable rejection]";
  } catch {
    return "[unserializable rejection]";
  }
}

try {
  globalThis.addEventListener("unhandledrejection", (event) => {
    try {
      const reason = event?.reason;
      const errorData = {
        message: serializeRejectionReason(reason).substring(0, 1000),
        stack: reason?.stack ? String(reason.stack).substring(0, 5000) : null,
        timestamp: Date.now(),
      };

      ipcRenderer.send("unhandled-rejection", errorData);
    } catch (err) {
      console.debug("Unhandled rejection forwarding failed:", err);
      // Best-effort forwarding, never throw from preload
    }
  });

  globalThis.addEventListener("error", (event) => {
    try {
      const errorData = {
        message: event?.message ? String(event.message).substring(0, 1000) : '',
        filename: event?.filename ? String(event.filename).substring(0, 200) : '',
        lineno: typeof event?.lineno === 'number' ? event.lineno : 0,
        colno: typeof event?.colno === 'number' ? event.colno : 0,
        timestamp: Date.now(),
        errorStack: event?.error?.stack ? String(event.error.stack).substring(0, 5000) : null,
      };
      
      ipcRenderer.send("window-error", errorData);
    } catch (err) {
      console.debug("Window error forwarding failed:", err);
    }
  });
} catch (err) {
  console.debug("Error handler setup failed:", err);
}
