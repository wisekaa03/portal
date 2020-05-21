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
    {
      name: '@storybook/preset-typescript',
      options: {
        tsLoaderOptions: {
          configFile: '../apps/portal/tsconfig.json',
        }
      }
    }
  ],
  webpackFinal: async (config) => {

    config.resolve = {
      ...(config.resolve || []),
      alias: {
        ...config.resolve.alias,
        ...resolveTsconfigPaths({ tsconfigPaths: '../apps/portal/tsconfig.json' }),
      },
    };

    // console.log(config);

    return config;
  },
};
