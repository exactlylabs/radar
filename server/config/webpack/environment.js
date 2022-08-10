const webpack = require('webpack');
const { environment } = require('@rails/webpacker')
const Sentry = require('@sentry/browser');
const test = require('config/initializers/sentry.rb');

environment.plugins.append(
  'ProvidePlugin-Sentry', // arbitrary name
  new webpack.ProvidePlugin({
    Sentry: ['Sentry', Sentry],
    testXXX: ['testXXX.rb', test]
  }),
);

module.exports = environment
