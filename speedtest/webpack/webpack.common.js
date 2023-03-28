require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
  return {
    // Entry point, from where all extraction should be made
    entry: path.resolve(__dirname, '../src/index.js'),
    // Init webpack rules to collect js, jsx, css files
    module: {
      rules: [
        {
          // Extract and Transpile ES6+ in to ES5
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        {
          // Extract CSS files
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader']
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
          test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(webmanifest|xml)$/i,
          type: 'asset/resource',
        }
      ]
    },
    // https://webpack.js.org/configuration/output/
    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: '[name].[contenthash].bundle.js',
      chunkFilename: '[name].[contenthash].chunk.js',
      publicPath: 'auto',
      clean: true,
      assetModuleFilename: 'static/[name][ext]',
      charset: true
    },
    // https://webpack.js.org/configuration/dev-server/
    devServer: {
      static: { directory: path.join(__dirname, '/public') },
      hot: true,
      compress: true,
      port: 9999,
      historyApiFallback: true,
      headers: {
        'Feature-Policy': 'geolocation http://localhost:9999'
      }
    },
    // https://webpack.js.org/configuration/plugins/
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, '../public/index.html'),
        scriptLoading: 'blocking', // need to specify this to prevent defer attribute on the bundled js -> mainly for dev reasons
      }),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash].css',
        chunkFilename: '[name].[contenthash].css'
      }),
      new CopyPlugin({
        patterns: [
          {from: path.resolve(__dirname, `../src/widget/widget.${env}.js`), to: './widget.js'},
          {from: path.resolve(__dirname, '../public/site.webmanifest'), to: './'}
        ]
      })
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
  };
};