/*
  * This script is used for development purposes.
  * For testing and debugging the extension.
 */

console.log("🔥 Development script loaded");
document.body.style.background = "#e3d3d3";

chrome.runtime.sendMessage({ type: "RELOAD_EXTENSION" }).then(r => {
  console.log("Extension reloaded:", r);
}).catch(err => {
  console.error("Error reloading extension:", err);
});
