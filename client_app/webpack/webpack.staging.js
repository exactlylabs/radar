const webpack = require('webpack');

module.exports = {
  mode: 'staging',
  // source-map - A full SourceMap is emitted as a separate file.
  // It adds a reference comment to the bundle so development tools know where to find it.
  devtool: 'source-map',
  plugins: [new webpack.DefinePlugin({
    REACT_APP_ENV: JSON.stringify('staging'),
    REACT_APP_API_BASE_URL: JSON.stringify('https://radar-staging.exactlylabs.com'),
    REACT_APP_SENTRY_DSN: JSON.stringify('https://824cb73d4b5149459eb889296687f94f@o1197382.ingest.sentry.io/6320151'),
    MAPBOX_ACCESS_TOKEN: JSON.stringify('pk.eyJ1IjoiZXVnZWRhbW0iLCJhIjoiY2w2YzlhOG42MXdxazNrbzE5MTA2cmFmbCJ9.qYBmAC0V6Z5eilJd2ND5yA'),
    MAPBOX_TILESET_URL: JSON.stringify('https://api.mapbox.com/styles/v1/eugedamm/cl6gn9zaj007n15nte2uyks96/tiles/512/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXVnZWRhbW0iLCJhIjoiY2w2YzlhOG42MXdxazNrbzE5MTA2cmFmbCJ9.qYBmAC0V6Z5eilJd2ND5yA')
  })],
};