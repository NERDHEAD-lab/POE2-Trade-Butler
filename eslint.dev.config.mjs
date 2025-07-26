import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import parser from '@typescript-eslint/parser';
import globals from 'globals';
import chalk from 'chalk';


export default defineConfig([
  { ignores: ['dist/**'] },
  { files: ['**/*.js'], languageOptions: { sourceType: 'module' } },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser
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
      'no-constant-condition': 'off'
    }
  },
  // 에러를 경고레벨로 tseslint.configs.recommended를 설정
  tseslint.configs.recommended.map(config => ({
    ...config,
    rules: Object.fromEntries(
      Object.entries(config.rules ?? {}).map(([rule, value]) => [
        rule,
        typeof value === 'string' ? value.replace('error', 'warn') : value
      ])
    )
  }))
]);


console.warn(
  chalk.yellowBright(
    '*************** TODO must be registered in GITHUB Issue ***************'
  )
);