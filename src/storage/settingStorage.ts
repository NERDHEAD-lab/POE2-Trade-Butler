import * as storage from './storage';
import { get, set, StorageType } from './storage';
import { LANGUAGE_NATIVE_NAMES } from '../utils/supportedLanguages';
import * as versionChecker from '../utils/versionChecker';

const KEY_PREFIX = 'poe2trade_settings_';

//override the default storage methods to include a prefix
function setSetting<T>(storageType: StorageType, key: string, value: T): Promise<void> {
  return set(storageType, `${KEY_PREFIX}${key}`, value);
}

function getSetting<T>(storageType: StorageType, key: string, defaultValue: T): Promise<T> {
  return get(storageType, `${KEY_PREFIX}${key}`, defaultValue);
}

function addOnChangeListener<T>(
  storageType: StorageType,
  key: string,
  listener: (newValue: T, oldValue: T) => void
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
const defaultLatestSearchUrl = 'about:blank';

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

// Butler Guide Shown
const defaultButlerGuideShown = false;

export function setButlerGuideShown(shown: boolean): Promise<void> {
  return setSetting('sync', 'butlerGuideShown', shown);
}

export function isButlerGuideShown(): Promise<boolean> {
  return getSetting('sync', 'butlerGuideShown', defaultButlerGuideShown);
}

// Language -> LANGUAGE_NATIVE_NAMES의 key와 일치해야 함 or "default"
const defaultLanguage = 'default';

export function setLanguage(language: string): Promise<void> {
  if (language !== 'default' && !Object.keys(LANGUAGE_NATIVE_NAMES).includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }
  return setSetting('sync', 'language', language);
}

export async function getLanguage(): Promise<string> {
  const language = await getSetting('sync', 'language', defaultLanguage);
  if (language !== 'default' && !Object.keys(LANGUAGE_NATIVE_NAMES).includes(language)) {
    await setLanguage(defaultLanguage);
    return defaultLanguage;
  }
  return language;
}

type i18nEntity = {
  version: string;
  i18n: Record<string, Record<string, { message: string }>>
}

async function setI18n(i18n: Record<string, Record<string, { message: string }>>): Promise<void> {
  return versionChecker.getInstalledVersion()
    .then((version) => {
      const i18nEntity: i18nEntity = {
        version: version,
        i18n: i18n
      };
      return setSetting('local', 'i18n', i18nEntity);
    });
}

export async function getOrFetchI18n(
  supplier: () => Promise<Record<string, Record<string, { message: string }>>>
): Promise<Record<string, Record<string, { message: string }>>> {
  const version = await versionChecker.getInstalledVersion();
  const cached = await getSetting<i18nEntity>('local', 'i18n', { version: '', i18n: {} });

  if (cached.version === version && Object.keys(cached.i18n).length === Object.keys(LANGUAGE_NATIVE_NAMES).length) {
    return cached.i18n;
  }

  const freshI18n = await supplier();
  console.log(`Fetched new i18n data for version ${version}:`, freshI18n);
  await setI18n(freshI18n);
  return freshI18n;
}

export async function flushI18n(): Promise<void> {
  const version = await versionChecker.getInstalledVersion();
  await setI18n({ [version]: {} });
}