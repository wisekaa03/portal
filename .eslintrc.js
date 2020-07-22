/** @format */

module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'babel',
    'react',
    'react-hooks',
    'standard',
    'graphql',
    'json',
    'jest',
    'promise',
    'unicorn',
    'eslint-comments',
  ],
  extends: [
    // 'standard',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'eslint:recommended',
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
    'plugin:promise/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:unicorn/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/babel',
    'prettier/react',
    'prettier/standard',
    'prettier/unicorn',
  ],
  settings: {
    'react': {
      version: 'detect',
    },
    'import/resolver': {
      node: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    },
    'import/ignore': ['.coffee$', '.(scss|less|css)$', '.(svg|png|jpe?g|webp|gif)(\\?.*)?$'],
  },
  globals: {
    window: true,
    document: true,
    process: true,
    __DEV__: true,
    __SERVER__: true,
  },
  parserOptions: {
    sourceType: 'module',
    jsx: true,
    useJSXTextNode: true,
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  rules: {
    'max-len': ['error', { code: 120, ignoreUrls: true }],
    'no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^(_|[A-Z]+)',
        varsIgnorePattern: '^(_|[A-Z]+)',
      },
    ],
    'prettier/prettier': [
      'error',
      {
        parser: 'typescript',
        printWidth: 120,
        singleQuote: true,
        useTabs: false,
        tabWidth: 2,
        semi: true,
        bracketSpacing: true,
        trailingComma: 'all',
        arrowParens: 'always',
        insertPragma: true,
        quoteProps: 'consistent',
        jsxSingleQuote: false,
        jsxBracketSameLine: false,
        htmlWhitespaceSensivity: 'css',
        proseWrap: 'never',
      },
    ],
    'react/prop-types': 'off',
    'unicorn/no-null': 'off',
    'unicorn/no-reduce': 'off',
    '@typescript-eslint/no-empty-function': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^(_|[A-Z]+)',
        varsIgnorePattern: '^(_|[A-Z]+)',
      },
    ],
    'unicorn/no-useless-undefined': 0,
    'unicorn/prevent-abbreviations': [
      'error',
      {
        replacements: {
          ref: false,
          e2e: false,
          props: {
            properties: false,
          },
          ctx: {
            context: false,
          },
          ext: {
            extension: false,
          },
          src: {
            source: false,
          },
        },
      },
    ],
    '@typescript-eslint/no-var-requires': 0,
  },
};
