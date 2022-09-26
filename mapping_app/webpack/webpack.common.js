require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackObfuscatorPlugin = require("webpack-obfuscator");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  // Entry point, from where all extraction should be made
  entry: path.resolve(__dirname, '../src/index.tsx'),
  // Init webpack rules to collect js, jsx, ts, tx, css files
  module: {
    rules: [
      {
        test: /\.(tsx|ts|d.ts)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        // Extract CSS files
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      }
    ]
  },
  // https://webpack.js.org/configuration/output/
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].js',
    chunkFilename: '[id].[chunkhash].js',
  },
  // https://webpack.js.org/configuration/dev-server/
  devServer: {
    static: { directory: path.join(__dirname, '../public') },
    hot: true,
    compress: true,
    port: 9999
  },
  // https://webpack.js.org/configuration/plugins/
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../public/index.html'),
    }),
  ],
  // https://webpack.js.org/configuration/optimization/
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          output: {
            comments: false,
          }
        },
      }),
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.ts', '.tsx', '.d.ts'],
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
};