import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.resolve(__dirname, '../_locales');

const languages = fs.readdirSync(localesDir).filter(name => {
  return fs.statSync(path.join(localesDir, name)).isDirectory();
});

// 각 언어의 current_language 메시지 추출
const languageNativeNames: Record<string, string> = {};

languages.forEach(lang => {
  const msgPath = path.join(localesDir, lang, 'messages.json');
  if (fs.existsSync(msgPath)) {
    try {
      const messages = JSON.parse(fs.readFileSync(msgPath, 'utf8'));
      if (messages.current_language && typeof messages.current_language.message === 'string') {
        languageNativeNames[lang] = messages.current_language.message;
      }
    } catch {
      console.warn(`[generate-supported-languages] Warning: failed to parse ${msgPath}`);
    }
  }
});

const targetFile = path.resolve(__dirname, '../src/utils/supportedLanguages.ts');
const content = `// ⚡️ This file is auto-generated. Do not edit manually.
export const SUPPORTED_LANGUAGES = ${JSON.stringify(languages)} as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_NATIVE_NAMES: Record<SupportedLanguage, string> = ${JSON.stringify(languageNativeNames, null, 2)} as const;
`;

fs.writeFileSync(targetFile, content);
console.log(`[generate-supported-languages] Supported languages: ${languages.join(', ')}`);
console.log(`[generate-supported-languages] Native names: ${JSON.stringify(languageNativeNames)}`);

console.log(`✅  Successfully generated ${path.relative(__dirname, targetFile)}`);
