/** @format */
/*eslint no-param-reassign:0,@typescript-eslint/explicit-function-return-type:0,@typescript-eslint/no-var-requires:0*/

//#region Imports NPM
const { resolve } = require('path');

require('dotenv').config({ path: resolve(__dirname, '../../.local/.env') });
// const NextWorkboxWebpackPlugin = require('next-workbox-webpack-plugin');

const withBundleAnalyzer = require('@next/bundle-analyzer');

const optimizedImages = require('next-optimized-images');

const withFonts = require('next-fonts');

const withPlugins = require('next-compose-plugins');
const Webpack = require('webpack');
//#endregion
//#region Imports Local
const resolveTsconfigPaths = require('../../tsconfig-paths-to-webpack-alias');
//#endregion

function withCustomWebpack(config = {}) {
  const { webpack } = config;

  config.webpack = (config, { isServer, buildId, dev /* , defaultLoaders */, ...rest }) => {
    config.resolve = {
      ...(config.resolve || []),
      alias: {
        ...config.resolve.alias,
        'google-libphonenumber': resolve(__dirname, './libphonenumber-stub.js'),
        ...resolveTsconfigPaths({ tsconfigPaths: '../../tsconfig.json' }),
      },
    };

    config.plugins = [
      ...(config.plugins || []),
      new Webpack.DefinePlugin({
        __DEV__: JSON.stringify(dev),
        __PRODUCTION__: JSON.stringify(!dev),
        __TEST__: JSON.stringify(process.env.NODE_ENV === 'test'),
        __SERVER__: JSON.stringify(isServer),
      }),
    ];

    // if (!isServer && !dev) {
    //   config.plugins.push(
    //     new NextWorkboxWebpackPlugin({
    //       // must, see next.config.js below
    //       buildId,
    //       // optional, next.js dist path as compiling. most of cases you don't need to fix it.
    //       distDir: config.distDir,
    //       // optional, which version of workbox will be used in between 'local' or 'cdn'. 'local'
    //       // option will help you use copy of workbox libs in localhost.
    //       importWorkboxFrom: 'local',
    //       // optional ,whether make a precache manifest of pages and chunks of Next.js app or not.
    //       precacheManifest: true,
    //       // optional, whether delete workbox path generated by the plugin.
    //       removeDir: true,
    //       // optional, path for generating sw files in build, `./static/workbox` is default
    //       swDestRoot: './.next/static/',
    //       // optional, path for serving sw files in build, `./static/workbox` is default
    //       swURLRoot: '/_next/static',
    //       // optional, you can use workbox-build options.
    //       // except swDest because of output location is fixed in 'static/workbox',
    //       // ...WorkboxBuildOptions,
    //     }),
    //   );
    // }

    // config.externals = [...(config.externals || []), nodeExternals()];
    // console.log(isServer ? 'Server' : 'Client', config);

    return webpack(config, { isServer, buildId, dev, ...rest });
  };

  return config;
}

const plugins = [
  [
    optimizedImages,
    {
      // these are the default values so you don't have to provide them if they are good enough for your use-case.
      // but you can overwrite them here with any valid value you want.
      inlineImageLimit: 8000,
      imagesFolder: 'images',
      imagesName: '[name]-[hash].[ext]',
      handleImages: ['jpeg', 'png', 'svg', 'webp', 'gif'],
      optimizeImages: true,
      optimizeImagesInDev: false,
      mozjpeg: {
        quality: 80,
      },
      optipng: {
        optimizationLevel: 3,
      },
      pngquant: false,
      gifsicle: {
        interlaced: true,
        optimizationLevel: 3,
      },
      svgo: {
        // enable/disable svgo plugins here
        js2svg: {
          pretty: false,
        },
        plugins: [
          {
            removeAttrs: { attrs: ['(data-name)', 'g:(id)'] },
          },
          {
            removeTitle: true,
          },
          {
            removeEmptyAttrs: true,
          },
          {
            removeEmptyText: true,
          },
          {
            removeViewBox: true,
          },
          {
            removeDesc: true,
          },
          // {
          //   removeXMLNS: true,
          // },
          {
            removeEditorsNSData: true,
          },
          {
            removeComments: true,
          },
          {
            removeUnusedNS: true,
          },
          {
            cleanupIDs: true,
          },
          {
            convertColors: true,
          },
          {
            sortDefsChildren: true,
          },
          {
            minifyStyles: true,
          },
          {
            collapseGroups: true,
          },
        ],
      },
      webp: {
        preset: 'default',
        quality: 75,
      },
    },
  ],
  [
    withBundleAnalyzer,
    {
      enabled: process.env.ANALYZE === 'true',
    },
  ],
  [withCustomWebpack],
  [withFonts, { enableSvg: false }],
];

const nextConfig = {
  devIndicators: {
    autoPrerender: false,
  },
  typescript: {
    ignoreDevErrors: true,
  },
  dist: '../../dist/apps/portal',
  compress: false,
  // crossOrigin: 'anonymous',
  poweredByHeader: false,
  // Kubernetes: when this is a build time, the environment variables are defined
  env: {
    PORT: process.env.PORT,
    DOMAIN: process.env.DOMAIN,
    MAIL_URL: process.env.MAIL_URL,
    SESSION_NAME: process.env.SESSION_NAME,
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
  },
};

module.exports = withPlugins(plugins, nextConfig);
