chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // reload the extension when a development script sends a message
  if (message.type === 'RELOAD_EXTENSION') {
    chrome.runtime.reload();
  } else if (message.type === 'FETCH') {
    fetch(message.url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        sendResponse({data: data.result});
      })
      .catch(error => {
        sendResponse({ error: error.message });
      });
    // Indicate that the response will be sent asynchronously
    return true;
  }
});