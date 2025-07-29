import * as settingStorage from '../storage/settingStorage';
import { LANGUAGE_NATIVE_NAMES } from './supportedLanguages';

const currentLanguage = await getCurrentLanguage();
const i18n: Record<string, Record<string, { message: string }>> = await getI18n();

// If the language is 'default', we will use the browser's default i18n API
async function getI18n(): Promise<Record<string, Record<string, { message: string }>>> {
  const i18n: Record<string, Record<string, { message: string }>> = {};
  // background cannot access "chrome-extension://" URL, so we need to fetch the localization files directly
  if (isBackground()) return i18n;

  return settingStorage.getOrFetchI18n(async () => {
    const fetches = Object.keys(LANGUAGE_NATIVE_NAMES).map(async lang => {
      const url = chrome.runtime.getURL(`_locales/${lang}/messages.json`);
      try {
        const response = await fetch(url);
        i18n[lang] = await response.json();
      } catch (error) {
        console.error(`Error loading localization file for ${lang}:`, error);
      }
    });

    await Promise.all(fetches);
    return i18n;
  });
}

async function getCurrentLanguage(): Promise<string> {
  const language = await settingStorage.getLanguage();
  console.log(`Current language set to: ${language}`);
  return language;
}

/**
 * Gets a localized message from the _locales directory.
 * Falls back to the default locale if the message is not found in the current locale.
 *
 * @param key The key of the message in the messages.json file
 * @param substitutions Optional substitutions for placeholders in the message
 * @returns The localized message
 */
export function getMessage(key: string, ...substitutions: string[]): string {
  if (currentLanguage === 'default' || isBackground()) {
    return chrome.i18n.getMessage(key, substitutions);
  }

  try {
    const message: string = i18n[currentLanguage]?.[key].message;
    if (!message) {
      console.warn(
        `Message key "${key}" not found in locale "${currentLanguage}". Falling back to default.`
      );
      return chrome.i18n.getMessage(key, substitutions);
    }

    if (substitutions.length === 0) {
      return message;
    }

    return substitutions.reduce((msg, sub, index) => {
      return msg.replace(`$${index + 1}`, sub);
    }, message);
  } catch {
    return chrome.i18n.getMessage(key, substitutions); // Fallback to default locale
  }
}

function isBackground(): boolean {
  return typeof window === 'undefined';
}

/**
 * Gets the current locale.
 * Returns the browser's UI language (navigator.language) if available, otherwise falls back to 'en'.
 *
 * @returns The current locale code
 */
export function getCurrentLocale(): string {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  // fallback for environments without navigator
  return 'en';
}
