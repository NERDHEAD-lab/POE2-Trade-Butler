chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // reload the extension when a development script sends a message
  if (message.type === "RELOAD_EXTENSION") {
    chrome.runtime.reload();
  }
});