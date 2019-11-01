/** @format */

const { NODE_ENV = 'development' } = process.env;

console.log(`-- Webpack <${NODE_ENV}> build --`);

module.exports = (options) => {
  const config = NODE_ENV !== 'production' ? require('./webpack.development.js') : require('./webpack.production.js');

  return {
    ...options,
    ...config,
    plugins: [...options.plugins, ...config.plugins],
    stats: { ...options.stats, ...config.stats },
  };
};
