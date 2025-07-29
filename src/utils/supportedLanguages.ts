// ⚡️ This file is auto-generated. Do not edit manually.
export const SUPPORTED_LANGUAGES = ['en', 'ja', 'ko', 'zh_CN', 'zh_TW'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_NATIVE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  zh_CN: '简体中文',
  zh_TW: '繁體中文'
} as const;
