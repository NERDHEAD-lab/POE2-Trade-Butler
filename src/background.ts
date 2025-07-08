import { executeLegacyVersionMigrations } from './storage/legacy/legacyVersionManager';
import * as searchHistory from './storage/searchHistoryStorage';
import * as favorite from './storage/favoriteStorage';
import * as previewStorage from './storage/previewStorage';
import { getCachedCheckVersion } from './utils/versionChecker';

await executeLegacyVersionMigrations();
await previewStorage.cleanExpiredOrphanSnapshots();

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
        sendResponse({ data: data.result });
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

favorite.addOnDeletedListener((deletedId) => {
  void previewStorage.deleteIfOrphaned(deletedId, 'favorite');
});

function alertVersion() {
  getCachedCheckVersion()
    .then(result => {
      // NEW_VERSION_AVAILABLE 일 경우 뱃지
      if (result.versionType === 'NEW_VERSION_AVAILABLE') {
        void chrome.action.setBadgeText({ text: '!' });
        void chrome.action.setBadgeBackgroundColor({ color: '#f00' });
      } else if (result.versionType === 'DEV') {
        void chrome.action.setBadgeText({ text: 'DEV' });
        void chrome.action.setBadgeBackgroundColor({ color: '#ff0' });
      } else {
        void chrome.action.setBadgeText({ text: '' });
        void chrome.action.setBadgeBackgroundColor({ color: '#00f' });
      }
      console.info(`Version check completed: ${result.installedVersion} (Latest: ${result.latestVersion})`);
    });
}

chrome.runtime.onStartup.addListener(() => alertVersion());

void chrome.alarms.create('dailyVersionCheck', { periodInMinutes: 60 * 24 }); // 24시간마다
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyVersionCheck') alertVersion();
});
