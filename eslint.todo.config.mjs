import { defineConfig } from 'eslint/config';
import parser from '@typescript-eslint/parser';
import globals from 'globals';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
    rules: {
      'no-warning-comments': ['warn', {
        terms: ['todo', 'fixme'],
        location: 'anywhere'  // ← 이거 중요
      }],
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-console': 'off',
      'no-debugger': 'off',
      'no-alert': 'off',
      'no-constant-condition': 'off',
    }
  }
]);
