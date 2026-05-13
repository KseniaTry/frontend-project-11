import js from '@eslint/js'
import globals from 'globals'
import stylistic from '@stylistic/eslint-plugin'

export default [
  {
    ignores: [
      '**/dist/**',
      'dist',
      'node_modules/**',
    ],
  },

  js.configs.recommended,

  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: false,
    jsx: false,
    commaDangle: 'always-multiline',
  }),

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'warn', // Предупреждать об использовании console.log
      'prefer-promise-reject-errors': 'error', // Ошибка, если Promise.reject без Error
      'no-async-promise-executor': 'error', // Запрещает async внутри new Promise
    },
  },
]
