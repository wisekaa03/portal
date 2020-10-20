/** @format */
/* eslint global-require:0, @typescript-eslint/no-var-requires:0, no-console:0 */

const { resolve } = require('path');
const DotenvWebpackPlugin = require('dotenv-webpack');
const Webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const { NODE_ENV = 'production' } = process.env;

console.log(`-- Webpack <${NODE_ENV}> build --`);

module.exports = (options) => {
  let c;
  const config = NODE_ENV === 'production' ? require('./webpack.production.js')(options) : require('./webpack.development.js')(options);

  if (!options) {
    c = {
      ...config,
      optimization: {
        minimize: false,
      },
      // entry: resolve(__dirname, 'ormconfig.ts'),
      output: {
        path: resolve(__dirname),
        filename: 'ormconfig.js',
        // library: 'postgres',
      },
      resolve: {
        ...config.resolve,
        extensions: ['.tsx', '.ts', '.js'],
        plugins: [new TsconfigPathsPlugin({ configFile: resolve(__dirname, './tsconfig.json') })],
      },
      plugins: [
        ...config.plugins,
        new Webpack.DefinePlugin({
          __DEV__: JSON.stringify(NODE_ENV === 'development'),
          __PRODUCTION__: JSON.stringify(NODE_ENV === 'production'),
          __TEST__: JSON.stringify(NODE_ENV === 'test'),
          __SERVER__: JSON.stringify(true),
        }),
        new DotenvWebpackPlugin({ path: resolve(__dirname, '.local/.env') }),
      ],
      externals: [nodeExternals({ allowlist: [/node_modules/, /apps/, /libs/] })],
      module: {
        rules: [
          {
            test: /\.js$/,
            use: [
              {
                loader: 'babel-loader',
                // options: {
                //   presets: ['es2018'],
                // },
              },
              {
                loader: 'shebang-loader',
              },
            ],
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: resolve(__dirname, './tsconfig.ormconfig.json'),
            },
          },
        ],
      },
    };
  } else {
    const entry = NODE_ENV === 'production' ? options.entry ?? [] : ['webpack/hot/poll?100', options.entry || undefined];

    c = {
      ...options,
      ...config,
      entry,
      plugins: [
        ...config.plugins,
        new Webpack.DefinePlugin({
          __DEV__: JSON.stringify(NODE_ENV === 'development'),
          __PRODUCTION__: JSON.stringify(NODE_ENV === 'production'),
          __TEST__: JSON.stringify(NODE_ENV === 'test'),
          __SERVER__: JSON.stringify(true),
        }),
        new DotenvWebpackPlugin({ path: resolve(__dirname, '.local/.env') }),
      ],
      stats: { ...config.stats },
    };
  }

  // Babel
  c.module.rules.unshift({
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          // presets: ['@babel/preset-env'],
          // TODO: https://stackoverflow.com/questions/59972341/how-to-make-webpack-accept-optional-chaining-without-babel
          plugins: ['@babel/plugin-proposal-optional-chaining', '@babel/plugin-proposal-nullish-coalescing-operator'],
        },
      },
    ],
  });

  // console.log('Config.module.rules:', c.module.rules);
  // c.module.rules.forEach((rule) => {
  //   console.log(`Config.module.rules.use "${rule.test}":`, rule.use);
  // });

  // console.log('Options:', options);
  // console.log('Config:', c);

  return c;
};
