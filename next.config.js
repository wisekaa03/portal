/** @format */
/* eslint no-param-reassign: 0 */

const { join, resolve } = require('path');
const DotenvWebpackPlugin = require('dotenv-webpack');

// const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');
const withCSS = require('@zeit/next-css');
const withSass = require('@zeit/next-sass');
const withFonts = require('next-fonts');
const withPlugins = require('next-compose-plugins');
const Webpack = require('webpack');

const svgoLoader = {
  loader: 'svgo-loader',
  options: {
    plugins: [
      {
        removeAttrs: {
          attrs: '(data-name)',
        },
      },
      // {
      //   cleanupIDs: true,
      // },
      // {
      //   removeXMLNS: true,
      // },
      // {
      //   removeEmptyAttrs: true,
      // },
      // {
      //   removeComments: true,
      // },
      // {
      //   removeTitle: true,
      // },
      // {
      //   removeEditorsNSData: true,
      // },
      // {
      //   minifyStyles: {
      //     ids: true,
      //     classes: true,
      //     tags: true,
      //   },
      // },
      // {
      //   removeViewBox: true,
      // },
      // {
      //   convertColors: true,
      // },
    ],
  },
};

function withCustomWebpack(conf = {}) {
  const { webpack } = conf;

  conf.webpack = (config, { /* buildId, */ dev, isServer /* , defaultLoaders */, ...rest }) => {
    config.plugins = [
      ...(config.plugins || []),
      new Webpack.DefinePlugin({
        __DEV__: JSON.stringify(dev),
        __SERVER__: JSON.stringify(isServer),
      }),
      new DotenvWebpackPlugin({ path: join(__dirname, '.env') }),
    ];

    config.module.rules = [
      ...(config.module.rules || []),
      ...[
        // {
        //   test: /\.(svg)$/,
        //   use: [
        //     {
        //       loader: 'react-svg-loader',
        //       options: {
        //         svgo: {
        //           ...svgoLoader.options,
        //         },
        //       },
        //     },
        //   ],
        // },
        // {
        //   test: /\.(gif|png|jpe?g|svg)$/i,
        //   use: [
        //     'file-loader',
        //     {
        //       loader: 'image-webpack-loader',
        //       options: {
        //         mozjpeg: {
        //           progressive: true,
        //           quality: 65,
        //         },
        //         optipng: {
        //           enabled: false,
        //         },
        //         pngquant: {
        //           quality: '65-90',
        //           speed: 4,
        //         },
        //         gifsicle: {
        //           interlaced: false,
        //         },
        //         webp: {
        //           quality: 75,
        //         },
        //         // svgo: {
        //         //   ...svgoLoader.options,
        //         // },
        //       },
        //     },
        //   ],
        // },
      ],
    ];

    // eslint-disable-next-line no-debugger
    // debugger;

    return webpack(config, { isServer, ...rest });
  };

  return conf;
}

function HACKremoveMinimizeOptionFromCssLoaders(config) {
  config.module.rules.forEach((rule) => {
    if (Array.isArray(rule.use)) {
      rule.use.forEach((m) => {
        if (m.loader === 'css-loader' && m.options && Object.keys(m.options).includes('minimize')) {
          // console.warn('HACK: Removing `minimize` option from `css-loader` entries in Webpack config');
          delete m.options.minimize;
        }
      });
    }
  });
}

const plugins = [
  [
    withCSS,
    {
      // cssModules: true,
      // cssLoaderOptions: {
      //   importLoaders: true,
      // },
      postcssLoaderOptions: {},
      webpack(config) {
        HACKremoveMinimizeOptionFromCssLoaders(config);
        return config;
      },
    },
  ],
  [withSass /* , { cssModules: true } */],
  [withFonts, { enableSvg: true }],
  // [withBundleAnalyzer],
  [withCustomWebpack],
];

const config = {
  devIndicators: {
    autoPrerender: false,
  },
  poweredByHeader: false,
  analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
  analyzeBrowser: ['browser', 'both'].includes(process.env.BUNDLE_ANALYZE),
  // bundleAnalyzerConfig: {
  //   server: {
  //     analyzerMode: 'static',
  //     reportFilename: '../bundles/server.html'
  //   },
  //   browser: {
  //     analyzerMode: 'static',
  //     reportFilename: '../bundles/client.html'
  //   }
  // },
};

module.exports = withPlugins(plugins, config);
