/** @format */
/* eslint @typescript-eslint/no-var-requires:0 */

const path = require('path');

const { resolve } = require('path');
// const webpack = require('webpack');
// const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (original) => {
  const config = {
    // entry: [path.resolve(__dirname, 'apps/portal/src/main.ts')],
    watch: false,
    mode: 'production',
    target: 'node',
    resolve: {
      ...original?.resolve,
      alias: {
        ...original?.resolve?.alias,
        'google-libphonenumber': path.resolve(__dirname, 'apps/portal/libphonenumber-stub.js'),
      },
    },
    optimization: {
      nodeEnv: 'production',
      flagIncludedChunks: true,
      chunkIds: 'total-size',
      moduleIds: 'size',
      sideEffects: true,
      usedExports: true,
      concatenateModules: true,
      splitChunks: {
        hidePathInfo: true,
        minSize: 30000,
        maxAsyncRequests: 5,
        maxInitialRequests: 3,
      },
      emitOnErrors: false,
      checkWasmTypes: true,
      minimize: true,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            warnings: true,
            ecma: 2020,
            compress: {
              // arrows: true,
              // arguments: false,
              // booleans: false,
              // booleans_as_integers: false,
              // collapse_vars: false,
              // comparisons: false,
              // computed_props: false,
              // conditionals: false,
              // dead_code: true,
              defaults: true,
              // directives: false,
              // drop_console: false,
              // drop_debugger: true,
              // ecma: 6,
              // evaluate: false,
              // expression: false,
              // hoist_funs: false,
              // hoist_props: false,
              // hoist_vars: false,
              // if_return: false,
              // inline: false,
              // join_vars: true,
              // keep_fargs: true,
              // keep_fnames: true,
              // keep_infinity: true,
              // loops: false,
              // module: false,
              // negate_iife: false,
              // passes: 1,
              // properties: false,
              // pure_funcs: null,
              // pure_getters: 'strict',
              // reduce_vars: false,
              // sequences: false,
              // side_effects: false,
              // switches: false,
              // toplevel: false,
              // top_retain: null,
              // typeofs: false,
              // unsafe: false,
              // unsafe_arrows: false,
              // unsafe_comps: false,
              // unsafe_math: false,
              // unsafe_Function: false,
              // unsafe_methods: false,
              // unsafe_proto: false,
              // unsafe_regexp: false,
              // unsafe_undefined: false,
              // unused: false,
              // warnings: true,
            },
            mangle: {
              // eval: false,
              // module: true,
              // reserved: [],
              // toplevel: false,
              // safari10: false,
            },
            keep_classnames: true,
            keep_fnames: false,
            module: true,
          },
        }),
      ],
    },
    plugins: [
      ...(original?.plugins || []),
      // new webpack.IgnorePlugin({
      //   /**
      //    * There is a small problem with Nest's idea of lazy require() calls,
      //    * Webpack tries to load these lazy imports that you may not be using,
      //    * so we must explicitly handle the issue.
      //    * Refer to: https://github.com/nestjs/nest/issues/1706
      //    */
      //   checkResource(resource) {
      //     const lazyImports = [
      //       // '@nestjs/microservices',
      //       // '@nestjs/platform-express',
      //       // 'class-validator',
      //       // 'class-transformer',
      //       // 'google-libphonenumber',
      //       // '@nestjs/graphql',
      //       // 'next',
      //       // 'cache-manager',
      //       // 'graphql',
      //       // 'jodit',
      //       // 'jodit-react',
      //     ];
      //     if (!lazyImports.includes(resource)) {
      //       return false;
      //     }
      //     try {
      //       require.resolve(resource);
      //     } catch (err) {
      //       return true;
      //     }
      //     return false;
      //   },
      // }),
    ],
  };

  if (original?.output?.filename.includes('/portal/')) {
    config.output = {
      path: resolve(__dirname, '.next/nest'),
      filename: 'main.js',
    };
  }

  return config;
};
