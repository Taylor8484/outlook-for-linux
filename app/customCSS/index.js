const fs = require("node:fs");

exports.onDidFinishLoad = function onDidFinishLoad(content, config) {
  const customCssLocation = getCustomCssLocation(config);
  if (customCssLocation) {
    applyCustomCSSToContent(content, customCssLocation);
  }
};

exports.onDidFrameFinishLoad = function onDidFrameFinishLoad(webFrame, config) {
  const customCssLocation = getCustomCssLocation(config);
  if (customCssLocation) {
    applyCustomCSSToFrame(webFrame, customCssLocation);
  }
};

function getCustomCssLocation(config) {
  if (config.customCSSLocation) {
    return config.customCSSLocation;
  }
  return null;
}

function applyCustomCSSToContent(content, cssLocation) {
  fs.readFile(cssLocation, "utf-8", (error, data) => {
    if (!error) {
      content.insertCSS(data);
    }
  });
}

/**
 * Applies custom CSS to iframe-based content. content.insertCSS() does not
 * reach sub-frames,
 * so we inject <style> elements directly into the DOM using JavaScript execution.
 * This is a workaround for iframe CSS isolation in Electron.
 *
 * @param {Electron.WebFrameMain} webFrame - The iframe's web frame
 * @param {string} cssLocation - Path to the CSS file to inject
 */
function applyCustomCSSToFrame(webFrame, cssLocation) {
  const customCssId = "tfl-custom-css-style";

  fs.readFile(cssLocation, "utf-8", (error, data) => {
    if (error) {
      return;
    }

    data = data.replaceAll("`", String.raw`\u0060`);

    webFrame
      .executeJavaScript(`
			if(!document.getElementById("${customCssId}")) {
				const style = document.createElement('style');
				style.id = "${customCssId}";
				style.type = "text/css";
				style.textContent = ${JSON.stringify(data)};
				document.head.appendChild(style);
			}
		`)
      .catch((err) => {
        // Sandboxed about:blank frames (Office Online paste) and frames
        // disposed mid-flight reject here. Both are expected; swallow so
        // the rejection does not trip the main-process unhandledRejection
        // handler in app/index.js and terminate the app.
        console.debug("[customCSS] executeJavaScript rejected:", err);
      });
  });
}
