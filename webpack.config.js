/** @format */

const { NODE_ENV = 'development' } = process.env;

console.log(`-- Webpack <${NODE_ENV}> build --`);

module.exports = (options) => {
  const config = NODE_ENV !== 'production' ? require('./webpack.development.js') : require('./webpack.production.js');
  const entry = NODE_ENV !== 'production' ? ['webpack/hot/poll?100', options.entry] : [options.entry];

  // let output;
  // if (!options.entry.includes('/apps/portal/')) {
  //   config.output = {
  //     filename: config.output,
  //     path: '/synchronization',
  //   };
  // }

  const c = {
    ...options,
    ...config,
    entry: [...entry],
    plugins: [...options.plugins, ...config.plugins],
    stats: { ...options.stats, ...config.stats },
  };

  // console.log('Options:', options);
  // console.log('Config:', c);

  return c;
};
