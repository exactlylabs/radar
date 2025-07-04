const webpack = require('webpack');

module.exports = {
  mode: 'production',
  // source-map - A full SourceMap is emitted as a separate file.
  // It adds a reference comment to the bundle so development tools know where to find it.
  devtool: 'source-map',
  plugins: [new webpack.DefinePlugin({
    REACT_APP_ENV: JSON.stringify('staging'),
    REACT_APP_API_BASE_URL: JSON.stringify('https://radar-staging.exactlylabs.com'),
    REACT_APP_SENTRY_DSN: JSON.stringify('https://8baaf015e1f84ed282a25a291f44e2ab@o1197382.ingest.sentry.io/6754277'),
    MAPBOX_ACCESS_TOKEN: JSON.stringify('pk.eyJ1IjoiZXhhY3RseWxhYnMiLCJhIjoiY2w3OXJqcXhjMG1vbzQycGxidHNqdXRtcCJ9.BTDEZoZFcVnMMftMm33EMw'),
    MAPBOX_TILESET_URL: JSON.stringify('https://api.mapbox.com/styles/v1/exactlylabs/cl80e3l7c000e14n4o8elyzhk/tiles/512/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXhhY3RseWxhYnMiLCJhIjoiY2w3OXJqcXhjMG1vbzQycGxidHNqdXRtcCJ9.BTDEZoZFcVnMMftMm33EMw')
  })],
};