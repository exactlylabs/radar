const webpack = require('webpack');

module.exports = {
  mode: 'development',
  // eval-source-map - Each module is executed with eval() and a SourceMap
  // is added as a DataUrl to the eval(). Initially it is slow, but it provides
  // fast rebuild speed and yields real files. Line numbers are correctly mapped
  // since it gets mapped to the original code.
  // It yields the best quality SourceMaps for development.
  devtool: 'eval-source-map',
  plugins: [new webpack.DefinePlugin({
    REACT_APP_ENV: JSON.stringify('development'),
    REACT_APP_API_BASE_URL: JSON.stringify('http://localhost:3000'),
    MAPBOX_ACCESS_TOKEN: JSON.stringify('pk.eyJ1IjoiZGNvc3RhIiwiYSI6ImNsMDE0M3p3YTBxbjUzcHFwNzFsazd0angifQ.OhNi1BTmkyFazLWj4kU6TQ'),
    MAPBOX_TILESET_URL: JSON.stringify('https://api.mapbox.com/styles/v1/dcosta/cl6xo58jj003r14pmmij5zscr/tiles/512/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZGNvc3RhIiwiYSI6ImNsMDE0M3p3YTBxbjUzcHFwNzFsazd0angifQ.OhNi1BTmkyFazLWj4kU6TQ')
  })]
};