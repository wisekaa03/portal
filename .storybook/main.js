/** @format */

const resolveTsconfigPaths = require('../tsconfig-paths-to-webpack-alias');

module.exports = {
  stories: ['../apps/portal/**/*.stories.tsx'],
  addons: [
    '@storybook/addon-viewport/register',
    '@storybook/addon-knobs/register',
    '@storybook/addon-actions/register',
    '@storybook/addon-links/register',
    'storybook-addon-i18n/register',
    '@storybook/addons',
    '@storybook/preset-typescript',
  ],
  webpackFinal: async (config) => {
    config.resolve = {
      ...(config.resolve || []),
      alias: {
        ...config.resolve.alias,
        ...resolveTsconfigPaths({ tsconfigPaths: '../tsconfig.json' }),
      },
    };

    return config;
  },
};
