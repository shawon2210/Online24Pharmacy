import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'scripts/**/*.js', 'test-*.js', 'vite.config.js']),

  // Server / Node files should use Node globals
  {
    files: ['server/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { 
        varsIgnorePattern: '^[A-Z_]|^_', 
        argsIgnorePattern: '^_|^e$|^error$',
        caughtErrorsIgnorePattern: '^_'
      }],
    },
  },

  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: Object.assign({}, globals.browser, { process: true }),
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { 
        varsIgnorePattern: '^[A-Z_]|^_', 
        argsIgnorePattern: '^_|^e$|^error$',
        caughtErrorsIgnorePattern: '^_'
      }],
    },
  },
  // Config/build files and prisma seed script run in Node
  {
    files: ['prisma/**/*.js', 'tailwind.config.js', 'postcss.config.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_|^e$|^error$' }],
    },
  },

  // Service worker runs in serviceworker global environment
  {
    files: ['public/sw.js'],
    languageOptions: {
      globals: globals.serviceworker,
      parserOptions: { ecmaVersion: 'latest' },
    },
  },
])
