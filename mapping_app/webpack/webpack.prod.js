const webpack = require('webpack');
const WebpackObfuscatorPlugin = require("webpack-obfuscator");

module.exports = {
  mode: 'production',
  // source-map - A full SourceMap is emitted as a separate file.
  // It adds a reference comment to the bundle so development tools know where to find it.
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      REACT_APP_ENV: JSON.stringify('production'),
      REACT_APP_API_BASE_URL: JSON.stringify('https://radar.exactlylabs.com'),
      REACT_APP_SENTRY_DSN: JSON.stringify('https://8baaf015e1f84ed282a25a291f44e2ab@o1197382.ingest.sentry.io/6754277'),
      MAPBOX_ACCESS_TOKEN: JSON.stringify('pk.eyJ1IjoiZXhhY3RseWxhYnMiLCJhIjoiY2w3OXJqcXhjMG1vbzQycGxidHNqdXRtcCJ9.BTDEZoZFcVnMMftMm33EMw'),
      MAPBOX_TILESET_URL: JSON.stringify('https://api.mapbox.com/styles/v1/exactlylabs/cl80e3l7c000e14n4o8elyzhk/tiles/512/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZXhhY3RseWxhYnMiLCJhIjoiY2w3OXJqcXhjMG1vbzQycGxidHNqdXRtcCJ9.BTDEZoZFcVnMMftMm33EMw'),
      AMPLITUDE_KEY: JSON.stringify('b1780b24ed7363fc885c337251da1d56'),
    },
    new WebpackObfuscatorPlugin({
      sourceMap: true,
    }, []))
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'post',
        exclude: /node_modules/,
        use: {
          loader: WebpackObfuscatorPlugin.loader,
          options: {
            sourceMap: true,
          }
        }
      }
    ]
  }
};