import { getSetting, setSetting, StorageType } from './storageLoader';

const KEY_PREFIX = 'poe2trade_settings_';

//override the default storage methods to include a prefix
function setSettingWithPrefix(storageType: StorageType, key: string, value: any): Promise<void> {
  return setSetting(storageType, `${KEY_PREFIX}${key}`, value);
}

function getSettingWithPrefix(storage: StorageType, key: string, defaultValue: any = false): Promise<typeof defaultValue> {
  return getSetting(storage, `${KEY_PREFIX}${key}`, defaultValue);
}

/* **************************************************************************************** */
/* *************************************** Settings *************************************** */
/* **************************************************************************************** */
// LatestTap
export type LatestTab = 'history' | 'favorites';
const defaultLatestTab: LatestTab = 'history';

export function setLatestTab(tap: LatestTab): Promise<void> {
  return setSettingWithPrefix('sync', 'latestTap', tap);
}

export function getLatestTab(): Promise<LatestTab> {
  return getSettingWithPrefix('sync', 'latestTap', defaultLatestTab);
}

// historyAutoAddEnabled
const defaultHistoryAutoAddEnabled = true;

export function setHistoryAutoAddEnabled(enabled: boolean): Promise<void> {
  return setSettingWithPrefix('sync', 'historyAutoAddEnabled', enabled);
}

export function isHistoryAutoAddEnabled(): Promise<boolean> {
  return getSettingWithPrefix('sync', 'historyAutoAddEnabled', defaultHistoryAutoAddEnabled);
}

// LatestSearchUrl
const defaultLatestSearchUrl = document.location.href;

export function setLatestSearchUrl(url: string): Promise<void> {
  return setSettingWithPrefix('local', 'latestSearchUrl', url);
}

export function getLatestSearchUrl(): Promise<string> {
  return getSettingWithPrefix('local', 'latestSearchUrl', defaultLatestSearchUrl);
}

// SidebarCollapsed
const defaultSidebarCollapsed = false;

export function setSidebarCollapsed(collapsed: boolean): Promise<void> {
  return setSettingWithPrefix('local', 'sidebarCollapsed', collapsed);
}

export function isSidebarCollapsed(): Promise<boolean> {
  return getSettingWithPrefix('local', 'sidebarCollapsed', defaultSidebarCollapsed);
}

// RedirectPoe2TradeEnabled
const defaultRedirectPoe2TradeEnabled = true;

export function setRedirectPoe2TradeEnabled(enabled: boolean): Promise<void> {
  return setSettingWithPrefix('sync', 'redirectPoe2TradeEnabled', enabled);
}

export function isRedirectPoe2TradeEnabled(): Promise<boolean> {
  return getSettingWithPrefix('sync', 'redirectPoe2TradeEnabled', defaultRedirectPoe2TradeEnabled);
}