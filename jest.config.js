/** @format */

const { pathsToModuleNameMapper } = require('ts-jest/utils');
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const { compilerOptions } = require('./tsconfig');

module.exports = {
  testTimeout: 180000,
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|css|scss|sass|less)$':
      '<rootDir>/apps/portal/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.[jt]s(x)?$': 'ts-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.svg$': 'jest-svg-transformer',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/(*.)+(spec|test).[jt]s?(x)'],
  setupFiles: ['./jest.setup.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/.git/',
    '<rootDir>/dist/',
    '<rootDir>/.next/',
    '<rootDir>/apps/portal/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/.local/',
  ],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.jest.json',
    },
  },
};
