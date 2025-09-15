import * as legacy from './storage/legacy/legacyVersionManager';
import * as searchHistory from './storage/searchHistoryStorage';
import * as favorite from './storage/favoriteStorage';
import * as previewStorage from './storage/previewStorage';
import { getCachedCheckVersion } from './utils/versionChecker';
import * as settingStorage from './storage/settingStorage';
import * as storageUsage from './storage/storageUsage';
import { marked } from 'marked';

Promise.resolve()
  .then(() => settingStorage.flushI18n())
  .then(() => legacy.executeLegacyVersionMigrations())
  .then(() => previewStorage.cleanExpiredOrphanSnapshots())
  .then(() => {
    // ping
    chrome.runtime.onConnect.addListener(port => {
      if (port.name === 'ping') {
        port.onMessage.addListener(msg => {
          if (msg === 'PING') {
            port.postMessage('PONG');
          }
        });
      }
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'RELOAD_EXTENSION') {
        chrome.runtime.reload();
      } else if (message.type === 'FETCH_LSCACHE') {
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
      } else if (message.type === 'FETCH_MARKDOWN') {
          async function handleFetchMarkdown(url: string, forceFetch: boolean): Promise<{ data?: string; error?: string }> {
            try {
              const noticeContext = await settingStorage.getNoticeContext(url);
              const lastModified = noticeContext.lastModified;
              let content = noticeContext.content;

              const response = await fetch(url, {
                headers: lastModified && !forceFetch ? { 'If-Modified-Since': lastModified } : {},
              });

              if (response.status === 304) {
                console.info(`Markdown not modified since last fetch. Using cached content for ${url}`);
                return { data: marked.parse(content, { breaks: true }) as string };
              }

              if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
              }

              content = await response.text();

              response.headers.forEach((value, key) => {
                console.log(`${key}: ${value}`);
              });
              if (!forceFetch) {
                await settingStorage.setNoticeContext(url, {
                  lastModified: response.headers.get('Last-Modified') || '',
                  content
                });
              }

              const html = marked.parse(content, { breaks: true }) as string;

              console.info(`Fetched and parsed markdown from ${message.url}`);
              return { data: html };
            } catch (error) {
              console.error('Error fetching markdown content:', error);
              return { error: (error as Error).message };
            }
          }

          handleFetchMarkdown(message.url, message.forceFetch).then(sendResponse);
          return true;
      }
    });

    searchHistory.addOnDeletedListener(deletedId => {
      void previewStorage.deleteIfOrphaned(deletedId, 'searchHistory');
    });

    favorite.addOnDeletedListener(deletedId => {
      void previewStorage.deleteIfOrphaned(deletedId, 'favorite');
    });

    function alertVersion() {
      const defaultIcon = {
        '16': './assets/icon.png',
        '128': './assets/icon(128x128).png'
      };

      const devIcon = {
        '16': './assets/icon-dev.png',
        '128': './assets/icon-dev(128x128).png'
      };

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
          console.info(
            `Version check completed: ${result.installedVersion} (Latest: ${result.latestVersion})`
          );
        });
    }

    chrome.runtime.onStartup.addListener(() => {
      alertVersion();

      storageUsage.usageInfoAll()
        .then(usageInfos => console.log('Storage usage information:', usageInfos))
        .catch(error => {
          console.error('Error retrieving storage usage information:', error);
        });
    });

    chrome.runtime.onInstalled.addListener(details => {
      console.log(`Extension installed or updated: ${details.reason}`);
      if (details.reason === 'install' || details.reason === 'update') {
        alertVersion();
      }
    });

    chrome.runtime.onUpdateAvailable.addListener(e => {
      console.log(`Update available: ${e.version}`);
      chrome.runtime.reload();
    });
  });
