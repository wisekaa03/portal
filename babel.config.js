/** @format */

module.exports = (api) => {
  api.cache(true);

  //#region Constants
  const constantsPresets = [
    [
      '@babel/preset-env',
      {
        useBuiltIns: false,
      },
    ],
    '@babel/typescript',
  ];

  const constantsPlugins = [
    // 'babel-plugin-react-require',
    ['@babel/plugin-proposal-optional-chaining', { loose: false }],
    ['@babel/plugin-proposal-nullish-coalescing-operator', { loose: false }],
    // '@babel/plugin-syntax-dynamic-import',
    // ['@babel/plugin-proposal-decorators', { legacy: true }],
    // ['@babel/proposal-class-properties', { loose: true }],
    // [
    //   '@babel/plugin-proposal-object-rest-spread',
    //   {
    //     useBuiltIns: true,
    //   },
    // ],
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
  ];
  //#endregion

  //#region Development
  const devProd = {
    presets: [
      [
        '@babel/preset-react',
        {
          // development: true,
        },
      ],
      ...constantsPresets,
    ],
    plugins: [...constantsPlugins],
  };
  //#endregion

  //#region Production
  const prodProd = {
    presets: ['@babel/preset-react', ...constantsPresets],
    plugins: [...constantsPlugins],
  };
  //#endregion

  //#region Test
  const testProd = {
    presets: [
      [
        '@babel/preset-react',
        {
          // development: true,
        },
      ],
      ...constantsPresets,
    ],
    plugins: [...constantsPlugins],
  };
  //#endregion

  //#region Config
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
      },
    },
  };
  //#endregion

  //#region Production Plugins
  if (process.env.NODE_ENV === 'production') {
    // This plugin inlines consecutive property assignments, array pushes, etc.
    config.env.production.plugins.push('transform-inline-consecutive-adds');
    // Ensure that reserved words are quoted in property accesses
    config.env.production.plugins.push('transform-member-expression-literals');
    // This plugin allows Babel to transform boolean literals into !0 for true and !1 for false.
    config.env.production.plugins.push('transform-minify-booleans');

    // Inlines bindings when possible. Tries to evaluate expressions and prunes unreachable as a result.
    config.env.production.plugins.push([
      'minify-dead-code-elimination',
      { keepFnName: true, keepFnArgs: false, keepClassName: true },
    ]);

    // Configurable "search and replace" plugin. Replaces matching nodes in the tree with
    // a given replacement node. For example you can replace process.NODE_ENV with "production"
    config.env.production.plugins.push([
      'minify-replace',
      {
        replacements: [
          {
            identifierName: '__DEV__',
            replacement: {
              type: 'numericLiteral',
              value: 0,
            },
          },
          {
            identifierName: 'process.env.NODE_ENV',
            replacement: {
              type: 'stringLiteral',
              value: 'production',
            },
          },
        ],
      },
    ]);
    // In: Infinity; Out: 1/0;
    config.env.production.plugins.push('minify-infinity');
    // In: [1000, -2000]; Out: [1e3, -2e4]
    config.env.production.plugins.push('minify-numeric-literals');
    // In: Boolean(x); Out: !!x;
    config.env.production.plugins.push('minify-type-constructors');
    config.env.production.plugins.push('transform-property-literals');
    // config.env.production.plugins.push('transform-regexp-constructors');
    // This plugin removes all debugger; statements.
    config.env.production.plugins.push('transform-remove-debugger');
    // For variable assignments, this removes rvals that evaluate to undefined (vars in functions only).
    // For functions, this removes return arguments that evaluate to undefined.
    config.env.production.plugins.push('transform-remove-undefined');
    // In: typeof foo === 'object'; Out: typeof foo == 'object';
    config.env.production.plugins.push('transform-simplify-comparison-operators');
    // This plugin transforms undefined into void 0 which returns undefined regardless of if it's been reassigned.
    config.env.production.plugins.push('transform-undefined-to-void');

    // In: if (bar !== null); Out: if (null !== bar);
    config.env.production.plugins.push('minify-flip-comparisons');

    // config.env.production.plugins.push(['minify-mangle-names', { exclude: { foo: true, bar: true } }]);

    // Merge sibling variables into one. - Warnings
    // config.env.production.plugins.push('transform-merge-sibling-variables');
    // Tries to evaluate expressions and inline the result.
    // config.env.production.plugins.push('minify-constant-folding');
    // In: !x && foo(); alert(0 && new Foo()); Out: x || foo(); alert(0); - Error
    // config.env.production.plugins.push('minify-guarded-expressions');
    // Minify Standard built-in Objects - Error
    // config.env.production.plugins.push('minify-builtins');
  } else if (process.env.NODE_ENV === 'development') {
    // This plugin inlines consecutive property assignments, array pushes, etc.
    config.env.development.plugins.push('transform-inline-consecutive-adds');
    // Ensure that reserved words are quoted in property accesses
    config.env.development.plugins.push('transform-member-expression-literals');
    // This plugin allows Babel to transform boolean literals into !0 for true and !1 for false.
    config.env.development.plugins.push('transform-minify-booleans');
    // Inlines bindings when possible. Tries to evaluate expressions and prunes unreachable as a result.
    config.env.development.plugins.push([
      'minify-dead-code-elimination',
      { keepFnName: true, keepFnArgs: false, keepClassName: true },
    ]);
    // Configurable "search and replace" plugin. Replaces matching nodes in the tree with
    // a given replacement node. For example you can replace process.NODE_ENV with "production"
    config.env.development.plugins.push([
      'minify-replace',
      {
        replacements: [
          {
            identifierName: '__DEV__',
            replacement: {
              type: 'numericLiteral',
              value: 0,
            },
          },
          {
            identifierName: 'process.env.NODE_ENV',
            replacement: {
              type: 'stringLiteral',
              value: 'development',
            },
          },
        ],
      },
    ]);
    // In: Infinity; Out: 1/0;
    config.env.development.plugins.push('minify-infinity');
    // In: [1000, -2000]; Out: [1e3, -2e4]
    config.env.development.plugins.push('minify-numeric-literals');
    // In: Boolean(x); Out: !!x;
    config.env.development.plugins.push('minify-type-constructors');
    config.env.development.plugins.push('transform-property-literals');
    config.env.development.plugins.push('transform-regexp-constructors');
    // For variable assignments, this removes rvals that evaluate to undefined (vars in functions only).
    // For functions, this removes return arguments that evaluate to undefined.
    config.env.development.plugins.push('transform-remove-undefined');
    // In: typeof foo === 'object'; Out: typeof foo == 'object';
    config.env.development.plugins.push('transform-simplify-comparison-operators');
    // This plugin transforms undefined into void 0 which returns undefined regardless of if it's been reassigned.
    config.env.development.plugins.push('transform-undefined-to-void');
    // In: if (bar !== null); Out: if (null !== bar);
    config.env.development.plugins.push('minify-flip-comparisons');
  }
  //#endregion

  // console.warn('process.env:', process.env);
  // console.warn('config:', config);
  // console.warn('config.env.production.presets:', config.env.production.presets);
  // console.warn('config.env.production.plugins:', config.env.production.plugins);

  return config;
};
