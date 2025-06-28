import { syncStorage } from './storageLoader';
import { localStorage } from './storageLoader';

const KEY_PREFIX = 'poe2trade_settings_';

function setSetting(storage: 'local' | 'sync', key: string, value: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const storageObj = storage === 'local' ? localStorage : syncStorage;
    storageObj.set({ [KEY_PREFIX + key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

function getSetting(storage: 'local' | 'sync', key: string, defaultValue: any = false): Promise<typeof defaultValue> {
  return new Promise((resolve, reject) => {
    const storageObj = storage === 'local' ? localStorage : syncStorage;
    storageObj.get(KEY_PREFIX + key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[KEY_PREFIX + key] !== undefined ? result[KEY_PREFIX + key] : defaultValue);
      }
    });
  });
}

// LatestTap
export type LatestTab = 'history' | 'favorites';
const defaultLatestTab: LatestTab = 'history';

export function setLatestTab(tap: LatestTab): Promise<void> {
  return setSetting('sync', 'latestTap', tap);
}

export function getLatestTab(): Promise<LatestTab> {
  return getSetting('sync', 'latestTap', defaultLatestTab);
}

// historyAutoAddEnabled
const defaultHistoryAutoAddEnabled = true;

export function setHistoryAutoAddEnabled(enabled: boolean): Promise<void> {
  return setSetting('sync', 'historyAutoAddEnabled', enabled);
}

export function isHistoryAutoAddEnabled(): Promise<boolean> {
  return getSetting('sync', 'historyAutoAddEnabled', defaultHistoryAutoAddEnabled);
}

// LatestSearchUrl
const defaultLatestSearchUrl = document.location.href;

export function setLatestSearchUrl(url: string): Promise<void> {
  return setSetting('local', 'latestSearchUrl', url);
}

export function getLatestSearchUrl(): Promise<string> {
  return getSetting('local', 'latestSearchUrl', defaultLatestSearchUrl);
}

// SidebarCollapsed
const defaultSidebarCollapsed = false;

export function setSidebarCollapsed(collapsed: boolean): Promise<void> {
  return setSetting('local', 'sidebarCollapsed', collapsed);
}

export function isSidebarCollapsed(): Promise<boolean> {
  return getSetting('local', 'sidebarCollapsed', defaultSidebarCollapsed);
}

// RedirectPoe2TradeEnabled
const defaultRedirectPoe2TradeEnabled = true;

export function setRedirectPoe2TradeEnabled(enabled: boolean): Promise<void> {
  return setSetting('sync', 'redirectPoe2TradeEnabled', enabled);
}

export function isRedirectPoe2TradeEnabled(): Promise<boolean> {
  return getSetting('sync', 'redirectPoe2TradeEnabled', defaultRedirectPoe2TradeEnabled);
}
