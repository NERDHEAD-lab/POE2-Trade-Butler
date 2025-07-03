import * as storage from './storage';
import { get, set, StorageType } from './storage';

const KEY_PREFIX = 'poe2trade_settings_';

//override the default storage methods to include a prefix
function setSetting(storageType: StorageType, key: string, value: any): Promise<void> {
  return set(storageType, `${KEY_PREFIX}${key}`, value);
}

function getSetting(storageType: StorageType, key: string, defaultValue: any = false): Promise<typeof defaultValue> {
  return get(storageType, `${KEY_PREFIX}${key}`, defaultValue);
}

function addOnChangeListener(
  storageType: StorageType,
  key: string,
  listener: (newValue: any, oldValue: any) => void
): void {
  storage.addOnChangeListener(storageType, `${KEY_PREFIX}${key}`, listener);
}

/* **************************************************************************************** */
/* *************************************** Settings *************************************** */
/* **************************************************************************************** */
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

export function addRedirectPoe2TradeEnabledChangeListener(
  listener: (newValue: boolean, oldValue: boolean) => void
): void {
  addOnChangeListener('sync', 'redirectPoe2TradeEnabled', listener);
}