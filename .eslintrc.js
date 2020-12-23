/** @format */
/* eslint @typescript-eslint/no-var-requires:0 */

const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig');

const localPathMapper = {
  ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: './' }),
  '^@public/(.*?)(\\?.*)?$': './public/$1',
  '^@images/(.*?)(\\?.*)?$': './public/images/$1',
};
if (localPathMapper['^@public/(.*)$']) {
  delete localPathMapper['^@public/(.*)$'];
}
if (localPathMapper['^@images/(.*)$']) {
  delete localPathMapper['^@images/(.*)$'];
}

module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'import',
    // 'babel',
    // 'react',
    // 'react-hooks',
    // 'standard',
    'graphql',
    // 'jest',
    // 'promise',
    // 'unicorn',
    // 'eslint-comments',
  ],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:jest/recommended',
    'prettier/@typescript-eslint',
    'prettier/react',
    'plugin:prettier/recommended',
    'airbnb',
    'airbnb/hooks',
    // 'plugin:promise/recommended',
    // 'plugin:eslint-comments/recommended',
    // 'plugin:unicorn/recommended',
    // 'prettier',
    // 'prettier/babel',
    // 'prettier/standard',
    // 'prettier/unicorn',
  ],
  settings: {
    // 'react': {
    //   version: 'detect',
    // },
    // 'import/parsers': {
    //   '@typescript-eslint/parser': ['.ts', '.tsx'],
    // },
    // 'extensions': {},
    'import/resolver': {
      typescript: {
        // alwaysTryTypes: true,
        project: ['tsconfig.json', 'tsconfig.server.json', 'apps/*/tsconfig.json', 'libs/*/tsconfig.json'],
      },
      node: {
        map: localPathMapper,
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      },
      alias: {
        map: localPathMapper,
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      },
    },
    'import/ignore': ['\\.coffee$', '\\.(scss|less|css)$', '\\.(svg|png|jpe?g|webp|gif)(\\?.*)?$'],
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
    // project: ['./tsconfig.json', 'apps/*/tsconfig.json', 'libs/*/tsconfig.json'],
  },
  env: {
    es6: true,
    browser: true,
    node: true,
    jest: true,
  },
  rules: {
    'jest/valid-title': 0,
    'no-confusing-arrow': 0,
    '@typescript-eslint/indent': 0,
    'operator-linebreak': 0,
    'function-paren-newline': 0,
    'no-param-reassign': 0,
    'comma-dangle': 0,
    'object-curly-newline': 0,
    'implicit-arrow-linebreak': 0,
    'import/prefer-default-export': 0,
    'class-methods-use-this': 0,
    'lines-between-class-members': 0,
    'quote-props': 0,
    'indent': 0,
    'no-nested-ternary': 0,
    'spaced-comment': ['error', 'always', { markers: ['#region', '#endregion', '/'] }],
    'max-len': ['error', { code: 140, ignoreUrls: true }],
    'import/no-extraneous-dependencies': 0,
    'no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^(_|[A-Z]+)',
        varsIgnorePattern: '^(_|[A-Z]+)',
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'prettier/prettier': [
      'error',
      {
        parser: 'typescript',
        printWidth: 140,
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
    'no-empty-function': 0,
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^(_|[A-Z]+)',
        varsIgnorePattern: '^(_|[A-Z]+)',
      },
    ],
    'react/require-default-props': 0,
    'react/jsx-curly-newline': 0,
    'no-use-before-define': 0,
    'jsx-a11y/anchor-is-valid': 0,
    'no-useless-constructor': 0,
    'react/jsx-one-expression-per-line': 0,
    'react/jsx-wrap-multilines': 0,
    'react/prop-types': 0,
    'react/static-property-placement': 0,
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.tsx', '.ts'] }],
    'react/jsx-props-no-spreading': 0,
    // '@typescript-eslint/no-var-requires': 0,
  },
};
