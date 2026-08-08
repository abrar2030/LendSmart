import js from '@eslint/js';
import {defineConfig} from 'eslint/config';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    plugins: {js},
    extends: ['js/recommended'],
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  // React 17+ uses the automatic JSX runtime, so files don't need to
  // `import React` just to use JSX - without this, every file with JSX
  // fails react/react-in-jsx-scope even though nothing is actually broken.
  pluginReact.configs.flat['jsx-runtime'],
  {
    settings: {
      react: {version: 'detect'},
    },
  },
  {
    // App source: React Native's JS runtime, plus the __DEV__ global RN
    // injects at bundle time.
    files: ['src/**/*.{js,jsx,ts,tsx}', 'App.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals['shared-node-browser'],
        __DEV__: 'readonly',
      },
    },
  },
  {
    // Node-context files: Metro/Jest/Babel config and manual Jest mocks
    // all run under Node, not RN, and are plain CommonJS - require() here
    // is intentional, not a mistake.
    files: [
      '*.config.{js,mjs,cjs}',
      'babel.config.js',
      '__mocks__/**/*.{js,jsx,ts,tsx}',
    ],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // jest.setup.js runs under Node *and* calls jest.mock/jest.fn at the
    // top level, so it needs both sets of globals.
    files: ['jest.setup.js'],
    languageOptions: {
      globals: {...globals.node, ...globals.jest},
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // Test files: Jest globals (describe/it/expect/jest/...) plus Node for
    // requires and RN's __DEV__.
    files: ['__tests__/**/*.{js,jsx,ts,tsx}', '**/*.test.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        __DEV__: 'readonly',
      },
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      // Matches the underscore-prefix convention already used throughout
      // this codebase (e.g. default context values like
      // `login: async (_credentials) => {}`, or `catch (_err)`) to mark a
      // binding as intentionally unused.
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // tseslint.configs.recommended enables this for .js/.jsx files too
      // (not just .ts/.tsx), which both duplicates the plain rule above
      // and ignores its ignore-pattern config since that's only applied
      // to .ts/.tsx below. Turn it off here so JS files are governed by a
      // single, correctly-configured rule.
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    rules: {
      // React Native doesn't ship PropTypes-checked native components the
      // way web React does, and this project uses PropTypes only sparsely
      // and intentionally (see AuthContext.js) rather than on every
      // component - enforcing it everywhere would require a much larger,
      // separate pass across the whole codebase.
      'react/prop-types': 'off',
    },
  },
]);
