/** @format */

const path = require('path');
const webpack = require('webpack');
// const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: [path.resolve(__dirname, 'src/main.ts')],
  watch: true,
  mode: 'production',
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
          '@nestjs/graphql',
          'next',
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
    path: path.resolve(__dirname, '.next/nest'),
    filename: 'main.js',
  },
};
