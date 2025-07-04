import { isKoreanServer } from './api';

/**
 * Gets a localized message from the _locales directory.
 * Falls back to the default locale if the message is not found in the current locale.
 * 
 * @param key The key of the message in the messages.json file
 * @param substitutions Optional substitutions for placeholders in the message
 * @returns The localized message
 */
export function getMessage(key: string, ...substitutions: string[]): string {
  // Use Chrome's i18n API to get the localized message
  return chrome.i18n.getMessage(key, substitutions);
}

/**
 * Gets the current locale.
 * Returns 'ko' for Korean servers, 'en' otherwise.
 * 
 * @returns The current locale code
 */
export function getCurrentLocale(): string {
  return isKoreanServer() ? 'ko' : 'en';
}