const path = require("path");

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, './public'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, './src'),
        use: ['babel-loader']
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.scss$/i,
        use: ['scss-loader']
      },
    ]
  },
  devServer: {
    static: { directory: path.resolve(__dirname, './public') },
    open: true,
    port: 9999,
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    fallback: {
      fs: false,
      tls: false,
      net: false,
      path: false,
      zlib: false,
      url: false,
      stream: false,
      os: false,
      crypto: false,
      http: false,
      https: false,
    }
  }
}