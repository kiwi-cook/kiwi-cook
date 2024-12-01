import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

export default typescriptEslint.config(
  { ignores: ['*.d.ts', '**/coverage', '**/dist'] },
  {
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.recommended,
      ...eslintPluginVue.configs['flat/recommended'],
    ],
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },
    rules: {
      'no-plusplus': 'off',
      'no-param-reassign': 'off',
      'no-void': 'off',
      'no-nested-ternary': 'off',
      'max-classes-per-file': 'off',

      'max-len': [
        'error',
        {
          code: 150,
        },
      ],

      'no-console': 'off',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'no-use-before-define': 'off',
      'prefer-promise-reject-errors': 'off',

      quotes: [
        'warn',
        'single',
        {
          avoidEscape: true,
        },
      ],

      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'no-unused-vars': 'off',
      'no-debugger': 'off',

      'vue/no-v-html': 'off',
    },
  },
  eslintConfigPrettier,
);
