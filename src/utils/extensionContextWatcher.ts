import { showToast } from './api';
import { getMessage } from './_locale';

/**
 * Handles Chrome extension context invalidation by auto-reloading the page
 * if the "Extension context invalidated" error occurs in any unhandled Promise rejection.
 */
export function registerExtensionContextAutoReload() {
  window.addEventListener("unhandledrejection", (event) => {
    const message = extractErrorMessage(event.reason);

    if (message && message.includes("Extension context invalidated")) {
      // Prevent infinite reload loop (optional)
      if (!window.sessionStorage.getItem("extension-context-auto-reload")) {
        showToast(getMessage('extension_reloaded_notice'), '#ff9800', 5000);
        window.sessionStorage.setItem("extension-context-auto-reload", "1");
        window.location.reload();
      } else {
        window.sessionStorage.removeItem("extension-context-auto-reload");
      }
    }
  });
}


function extractErrorMessage(reason: unknown): string | undefined {
  if (reason instanceof Error) {
    return reason.message;
  }
  if (typeof reason === "string") {
    return reason;
  }
  // 객체이고 message가 string일 때만!
  if (
    typeof reason === "object" &&
    reason !== null &&
    "message" in reason &&
    typeof (reason as { message?: unknown }).message === "string"
  ) {
    return (reason as { message: string }).message;
  }
  return undefined;
}