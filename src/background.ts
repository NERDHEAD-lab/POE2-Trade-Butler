import { executeLegacyVersionMigrations } from './storage/legacy/legacyVersionManager';
import * as searchHistory from './storage/searchHistoryStorage';
import * as favorite from './storage/favoriteStorage';
import * as previewStorage from './storage/previewStorage';

chrome.runtime.onInstalled.addListener(async () => {
  console.log('[background] Extension installed or updated. Running legacy storage migration...');
  try {
    await executeLegacyVersionMigrations();
    console.log('[background] Migration completed.');
  } catch (err) {
    console.error('[background] Migration failed:', err);
  }
});

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

searchHistory.addOnDeletedListener((deletedId) => {
  void previewStorage.deleteIfOrphaned(deletedId, 'searchHistory');
});

//TODO: favoriteStorage에 삭제 리스너 추가
// favorite.addOnDeletedListener((deletedId) => {
//   void previewStorage.deleteIfOrphaned(deletedId, 'favorite');
// });