import { StorageManager, StorageType } from './storage';
import { LANGUAGE_NATIVE_NAMES } from '../utils/supportedLanguages';
import * as versionChecker from '../utils/versionChecker';

const KEY_PREFIX = 'poe2trade_settings_';

function createStorageManager<T>(
  type: StorageType,
  key: string,
  defaultValue: T
): StorageManager<T> {
  return new StorageManager<T>(type, `${KEY_PREFIX}${key}`, () => defaultValue);
}

/* **************************************************************************************** */
/* *************************************** Settings *************************************** */
/* **************************************************************************************** */
// LatestTap
export type LatestTab = 'history' | 'favorites';
const defaultLatestTab: LatestTab = 'history';
const latestTabConfig = createStorageManager<LatestTab>('sync', 'latestTap', defaultLatestTab);

export function setLatestTab(tap: LatestTab): Promise<void> {
  return latestTabConfig.set(tap);
}

export function getLatestTab(): Promise<LatestTab> {
  return latestTabConfig.get();
}

// historyAutoAddEnabled
const defaultHistoryAutoAddEnabled = true;
const historyAutoAddEnabledConfig = createStorageManager<boolean>(
  'sync',
  'historyAutoAddEnabled',
  defaultHistoryAutoAddEnabled
);

export function setHistoryAutoAddEnabled(enabled: boolean): Promise<void> {
  return historyAutoAddEnabledConfig.set(enabled);
}

export function isHistoryAutoAddEnabled(): Promise<boolean> {
  return historyAutoAddEnabledConfig.get();
}

// LatestSearchUrl
const defaultLatestSearchUrl = 'about:blank';
const latestSearchUrlConfig = createStorageManager<string>(
  'local',
  'latestSearchUrl',
  defaultLatestSearchUrl
);

export function setLatestSearchUrl(url: string): Promise<void> {
  return latestSearchUrlConfig.set(url);
}

export function getLatestSearchUrl(): Promise<string> {
  return latestSearchUrlConfig.get();
}

// SidebarCollapsed
const defaultSidebarCollapsed = false;
const sidebarCollapsedConfig = createStorageManager<boolean>(
  'local',
  'sidebarCollapsed',
  defaultSidebarCollapsed
);

export function setSidebarCollapsed(collapsed: boolean): Promise<void> {
  return sidebarCollapsedConfig.set(collapsed);
}

export function isSidebarCollapsed(): Promise<boolean> {
  return sidebarCollapsedConfig.get();
}

// RedirectPoe2TradeEnabled
const defaultRedirectPoe2TradeEnabled = true;
const defaultRedirectPoe2TradeEnabledConfig = createStorageManager<boolean>(
  'sync',
  'redirectPoe2TradeEnabled',
  defaultRedirectPoe2TradeEnabled
);

export function setRedirectPoe2TradeEnabled(enabled: boolean): Promise<void> {
  return defaultRedirectPoe2TradeEnabledConfig.set(enabled);
}

export function isRedirectPoe2TradeEnabled(): Promise<boolean> {
  return defaultRedirectPoe2TradeEnabledConfig.get();
}

export function addRedirectPoe2TradeEnabledChangeListener(
  listener: (newValue: boolean, oldValue: boolean) => void
): void {
  defaultRedirectPoe2TradeEnabledConfig.addOnChangeListener(listener);
}

// Butler Guide Shown
const defaultButlerGuideShown = false;
const butlerGuideShownConfig = createStorageManager<boolean>(
  'sync',
  'butlerGuideShown',
  defaultButlerGuideShown
);

export function setButlerGuideShown(shown: boolean): Promise<void> {
  return butlerGuideShownConfig.set(shown);
}

export function isButlerGuideShown(): Promise<boolean> {
  return butlerGuideShownConfig.get();
}

// Language -> LANGUAGE_NATIVE_NAMES의 key와 일치해야 함 or "default"
const defaultLanguage = 'default';
const languageConfig = createStorageManager<string>('sync', 'language', defaultLanguage);

export function setLanguage(language: string): Promise<void> {
  if (language !== 'default' && !Object.keys(LANGUAGE_NATIVE_NAMES).includes(language)) {
    throw new Error(`Unsupported language: ${language}`);
  }
  return languageConfig.set(language);
}

export async function getLanguage(): Promise<string> {
  const language = await languageConfig.get();
  if (language !== 'default' && !Object.keys(LANGUAGE_NATIVE_NAMES).includes(language)) {
    await setLanguage(defaultLanguage);
    return defaultLanguage;
  }
  return language;
}

type i18nEntity = {
  version: string;
  i18n: Record<string, Record<string, { message: string }>>;
};

const defaultI18n: i18nEntity = {
  version: '',
  i18n: {}
};

const i18nConfig = createStorageManager<i18nEntity>('local', 'i18n', defaultI18n);

async function setI18n(i18n: Record<string, Record<string, { message: string }>>): Promise<void> {
  return versionChecker.getInstalledVersion().then(version => {
    const i18nEntity: i18nEntity = {
      version: version,
      i18n: i18n
    };
    return i18nConfig.set(i18nEntity);
  });
}

export async function getOrFetchI18n(
  supplier: () => Promise<Record<string, Record<string, { message: string }>>>
): Promise<Record<string, Record<string, { message: string }>>> {
  const version = await versionChecker.getInstalledVersion();
  const cached = await i18nConfig.get();

  if (
    cached.version === version &&
    Object.keys(cached.i18n).length === Object.keys(LANGUAGE_NATIVE_NAMES).length
  ) {
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

const defaultSidebarOpacity = 0.8;
const sidebarOpacityConfig = createStorageManager<number>(
  'sync',
  'sidebarOpacity',
  defaultSidebarOpacity
);

export function setSidebarOpacity(opacity: number): Promise<void> {
  if (opacity < 0 || opacity > 1) {
    throw new Error('Opacity must be between 0 and 1');
  }
  return sidebarOpacityConfig.set(opacity);
}

export function getSidebarOpacity(): Promise<number> {
  return sidebarOpacityConfig.get();
}

//getPreviewOverlayEnabled

const defaultPreviewOverlayEnabled = true;
const previewOverlayEnabledConfig = createStorageManager<boolean>(
  'sync',
  'previewOverlayEnabled',
  defaultPreviewOverlayEnabled
);

export function setPreviewOverlayEnabled(enabled: boolean): Promise<void> {
  return previewOverlayEnabledConfig.set(enabled);
}

export function getPreviewOverlayEnabled(): Promise<boolean> {
  return previewOverlayEnabledConfig.get();
}