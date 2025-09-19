/**
 * Ping the background script to check if the connection is alive.
 * Service worker may be unloaded when idle, so we need to ping it to keep it alive.
 * @param retryCount - Number of retry attempts (default: 3)
 * @returns A promise that resolves if the ping is successful, or rejects if it fails after retries.
 */
export function ping(retryCount?:number): Promise<void> {
  if (!retryCount) {
    retryCount = 3;
  } else if (retryCount <= 0) {
    return Promise.reject(new Error("Ping failed: Maximum retry attempts reached"));
  }

  return new Promise<void>((resolve, reject) => {
    try {
      const port = chrome.runtime.connect({ name: 'ping' });

      port.onMessage.addListener((msg) => {
        if (msg.type === 'PONG') {
          port.disconnect();
          console.info("Connection successful");
          resolve();
        }
      });

      port.onDisconnect.addListener(() => {
        if (chrome.runtime.lastError) {
          // reject(new Error("Ping failed: " + chrome.runtime.lastError.message));
          console.info("Ping failed, retrying...");
          setTimeout(() => {
            ping(retryCount! - 1).then(resolve).catch(reject);
          }, 500);
        }
      });
    } catch (error) {
      console.error("Ping error:", error);
      setTimeout(() => {
        ping(retryCount! - 1).then(resolve).catch(reject);
      }, 500);
    }
  });
}