/** @format */
/* eslint func-names:0, @typescript-eslint/no-var-requires:0 */
// #region Imports NPM
// const path = require('path');
// #endregion
// #region Imports Local
// #endregion

module.exports = function(api) {
  api.cache(true);

  /*
  const oldProd = {
    presets: ['next/babel', ['@zeit/next-typescript/babel', { isTSX: true, allExtensions: true }]],
    plugins: [
      '@babel/proposal-class-properties',
      '@babel/proposal-object-rest-spread',
      [
        'module-resolver',
        {
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
          root: [__dirname],
          alias: {},
        },
      ],
      [
        'babel-plugin-transform-imports',
        {
          '@material-ui/core': {
            // eslint-disable-next-line no-template-curly-in-string
            transform: '@material-ui/core/${member}',
            preventFullImport: true,
          },
          '@material-ui/icons': {
            // eslint-disable-next-line no-template-curly-in-string
            transform: '@material-ui/icons/${member}',
            preventFullImport: true,
          },
        },
      ],
      [
        'babel-plugin-import',
        {
          libraryName: '@material-ui/core',
          // Use "'libraryDirectory': ''," if your bundler does not support ES modules
          libraryDirectory: 'esm',
          camel2DashComponentName: false,
        },
        'core',
      ],
      [
        'babel-plugin-import',
        {
          libraryName: '@material-ui/icons',
          // Use "'libraryDirectory': ''," if your bundler does not support ES modules
          libraryDirectory: 'esm',
          camel2DashComponentName: false,
        },
        'icons',
      ],
    ],
  };
  */

  const devProd = {
    plugins: [
      // "babel-plugin-styled-components",
      'babel-plugin-react-require',
      '@babel/plugin-syntax-dynamic-import',
      // './node_modules/next/dist/build/babel/plugins/react-loadable-plugin',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-class-properties',
      [
        '@babel/plugin-proposal-object-rest-spread',
        {
          useBuiltIns: true,
        },
      ],
    ],
    presets: [
      [
        'next/babel',
        {
          'transform-runtime': {
            corejs: '3',
          },
        },
      ],
      [
        '@babel/preset-env',
        {
          debug: true,
          modules: false,
          exclude: ['transform-typeof-symbol'],
          useBuiltIns: 'usage',
          corejs: '3.1',
        },
      ],
      [
        '@babel/preset-react',
        {
          development: true,
        },
      ],
      ['@zeit/next-typescript/babel', { isTSX: true, allExtensions: true }],
    ],
  };

  const prodProd = {
    plugins: [
      // "babel-plugin-styled-components",
      'babel-plugin-react-require',
      '@babel/plugin-syntax-dynamic-import',
      // './node_modules/next/dist/build/babel/plugins/react-loadable-plugin',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-optional-chaining',
      [
        '@babel/plugin-proposal-object-rest-spread',
        {
          useBuiltIns: true,
        },
      ],
    ],
    presets: [
      [
        'next/babel',
        {
          'transform-runtime': {
            corejs: '3',
          },
        },
      ],
      [
        '@babel/preset-env',
        {
          modules: false,
          exclude: ['transform-typeof-symbol'],
          useBuiltIns: 'usage',
          corejs: '3.1',
        },
      ],
      '@babel/preset-react',
      ['@zeit/next-typescript/babel', { isTSX: true, allExtensions: true }],
    ],
  };

  const testProd = {
    plugins: [
      // 'babel-plugin-styled-components',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-class-properties',
    ],
    presets: [
      [
        'next/babel',
        {
          'transform-runtime': {
            corejs: '3',
          },
        },
      ],
      [
        '@babel/preset-react',
        {
          development: true,
        },
      ],
      [
        '@babel/preset-env',
        {
          targets: 'node 10.16',
          useBuiltIns: false,
          ignoreBrowserslistConfig: true,
        },
      ],
      ['@zeit/next-typescript/babel', { isTSX: true, allExtensions: true }],
    ],
  };

  const config = {
    env: {
      development: {
        ...devProd,
      },

      production: {
        ...prodProd,
      },

      test: {
        ...testProd,
        // presets: [
        //   [
        //     'next/babel', { 'preset-env': { modules: 'commonjs' } }
        //   ],
        //   '@zeit/next-typescript/babel'
        // ],
      },
    },
  };

  // console.warn('process.env:', process.env);

  // TODO: why this is not working ?
  if (0 && process.env.NODE_ENV === 'production') {
    config.env.production.plugins.push('transform-inline-consecutive-adds');
    config.env.production.plugins.push('transform-member-expression-literals');
    config.env.production.plugins.push('transform-merge-sibling-variables');
    config.env.production.plugins.push('transform-minify-booleans');
    config.env.production.plugins.push('minify-builtins');
    config.env.production.plugins.push('minify-constant-folding');

    config.env.production.plugins.push([
      'minify-dead-code-elimination',
      { keepFnName: true, keepFnArgs: false, keepClassName: false },
    ]);
    config.env.production.plugins.push([
      'minify-replace',
      {
        // TODO: придумать чтобы мои серверные отличались от клиентских
        replacements: [
          {
            identifierName: '__DEV__',
            replacement: {
              type: 'booleanLiteral',
              value: true,
            },
          },
        ],
      },
    ]);

    config.env.production.plugins.push('minify-guarded-expressions');
    config.env.production.plugins.push('minify-infinity');
    config.env.production.plugins.push(['minify-mangle-names', { exclude: { foo: true, bar: true } }]);
    config.env.production.plugins.push('minify-numeric-literals');
    config.env.production.plugins.push('minify-type-constructors');
    config.env.production.plugins.push('transform-property-literals');
    config.env.production.plugins.push('transform-regexp-constructors');
    config.env.production.plugins.push(['transform-remove-console', { exclude: ['error'] }]);
    config.env.production.plugins.push('transform-remove-debugger');
    config.env.production.plugins.push('transform-remove-undefined');
    config.env.production.plugins.push('transform-simplify-comparison-operators');
    config.env.production.plugins.push('transform-undefined-to-void');
    // TODO: разобраться почему navbar не работает при включенном
    // config.env.production.plugins.push('minify-simplify');
    // TODO: разобраться почему babel-plugin-minify-flip-comparisons не работает
    // config.env.production.plugins.push('minify-flip-comparisons');
  }

  return config;
};
