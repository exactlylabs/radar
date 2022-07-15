const webpack = require('webpack');

module.exports = {
  mode: 'production',
  // source-map - A full SourceMap is emitted as a separate file.
  // It adds a reference comment to the bundle so development tools know where to find it.
  devtool: 'source-map',
  plugins: [new webpack.DefinePlugin({
    REACT_APP_ENV: JSON.stringify('production'),
    REACT_APP_API_BASE_URL: JSON.stringify('https://radar.exactlylabs.com'),
    REACT_APP_SENTRY_DSN: JSON.stringify('https://824cb73d4b5149459eb889296687f94f@o1197382.ingest.sentry.io/6320151'),
  })],
};