/** @format */

const path = require('path');
const webpack = require('webpack');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const { NODE_ENV = 'production' } = process.env;

console.log(`-- Webpack <${NODE_ENV}> build --`);

module.exports = {
  entry: './server/main.ts',
  mode: NODE_ENV,
  target: 'node',
  plugins: [
    new webpack.IgnorePlugin({
      /**
       * There is a small problem with Nest's idea of lazy require() calls,
       * Webpack tries to load these lazy imports that you may not be using,
       * so we must explicitly handle the issue.
       * Refer to: https://github.com/nestjs/nest/issues/1706
       */
      checkResource(resource) {
        const lazyImports = [
          '@nestjs/microservices',
          '@nestjs/platform-express',
          '@nestjs/grahpql',
          'cache-manager',
          'class-validator',
          'class-transformer',
          'graphql',
        ];
        if (!lazyImports.includes(resource)) {
          return false;
        }
        try {
          require.resolve(resource);
        } catch (err) {
          return true;
        }
        return false;
      },
    }),
  ],
  output: {
    path: path.resolve(__dirname, '.nest'),
    filename: 'main.js',
  },
  resolve: {
    extensions: ['.mjs', '.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.server.json' })],
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        use: [{ loader: 'ts-loader' /* , options: { transpileOnly: true } */ }] /* exclude: /node_modules/  */,
      },
    ],
  },
  // stats: {
  //   // This is optional, but it hides noisey warnings
  //   warningsFilter: [
  //     'node_modules/express/lib/view.js',
  //     'node_modules/@nestjs/common/utils/load-package.util.js',
  //     'node_modules/@nestjs/core/helpers/load-adapter.js',
  //     'node_modules/optional/optional.js',
  //     (warning) => false,
  //   ],
  // },
};
