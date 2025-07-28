import * as legacy from './storage/legacy/legacyVersionManager';
import * as searchHistory from './storage/searchHistoryStorage';
import * as favorite from './storage/favoriteStorage';
import * as previewStorage from './storage/previewStorage';
import { getCachedCheckVersion } from './utils/versionChecker';
import * as settingStorage from './storage/settingStorage';
import * as storageUsage from './storage/storageUsage';

Promise.resolve()
  .then(() => settingStorage.flushI18n())
  .then(() => legacy.executeLegacyVersionMigrations())
  .then(() => previewStorage.cleanExpiredOrphanSnapshots())
  .then(() => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
        return true;
      }
    });

    searchHistory.addOnDeletedListener((deletedId) => {
      void previewStorage.deleteIfOrphaned(deletedId, 'searchHistory');
    });

    favorite.addOnDeletedListener((deletedId) => {
      void previewStorage.deleteIfOrphaned(deletedId, 'favorite');
    });

    const defaultIcon = {
      '16': './assets/icon.png',
      '128': './assets/icon(128x128).png'
    };

    const devIcon = {
      '16': './assets/icon-dev.png',
      '128': './assets/icon-dev(128x128).png'
    };

    function alertVersion() {
      getCachedCheckVersion()
        .then(result => {
          if (result.versionType === 'NEW_VERSION_AVAILABLE') {
            void chrome.action.setBadgeText({ text: '🔄' });
            void chrome.action.setBadgeBackgroundColor({ color: '#ff9800' });
          } else if (result.versionType === 'DEV') {
            void chrome.action.setBadgeText({ text: '' });
            void chrome.action.setBadgeBackgroundColor({ color: '#4caf50' });
            void chrome.action.setIcon({ path: devIcon });
          } else {
            void chrome.action.setBadgeText({ text: '' });
            void chrome.action.setBadgeBackgroundColor({ color: '#4caf50' });
            void chrome.action.setIcon({ path: defaultIcon });
          }
          console.info(`Version check completed: ${result.installedVersion} (Latest: ${result.latestVersion})`);
        });
    }

    chrome.runtime.onStartup.addListener(() => {
      alertVersion();
    });

    chrome.runtime.onInstalled.addListener((details) => {
      console.log(`Extension installed or updated: ${details.reason}`);
      if (details.reason === 'install' || details.reason === 'update') {
        alertVersion();
      }
    });

    chrome.runtime.onUpdateAvailable.addListener((e) => {
      console.log(`Update available: ${e.version}`);
      chrome.runtime.reload();
    });

    alertVersion();
  })
  .then(() => storageUsage.usageInfoAll())
  .then(usageInfos => console.log('Storage usage information:', usageInfos))
  .catch(error => {
    console.error('Error during background script initialization:', error);
  });