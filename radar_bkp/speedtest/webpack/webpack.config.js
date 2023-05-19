const {merge} = require('webpack-merge');
const commonConfig = require('./webpack.common.js');

module.exports = ({ env }) => {
  const envConfig = require(`./webpack.${env}.js`);
  // merge default configuration with a chosen mode configuration
  return merge(commonConfig(env), envConfig);
};