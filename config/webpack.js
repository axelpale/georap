// config/webpack.js

var webpack = require('webpack');
var path = require('path');
var local = require('./local');

// Depend on environment.
// See http://stackoverflow.com/a/31228568/638546
var PROD = (process.env.NODE_ENV === 'production');

// compile js assets into a single bundle file
module.exports = {
  devtool: 'source-map',
  entry: [
    path.resolve(__dirname, '../public/index.js'),
  ],
  output: {
    path: local.staticDir,
    filename: 'js/app.bundle.js',
    sourceMapFilename: '[file].map'
  },

  module: {
    loaders: [
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.ejs$/, loader: 'ejs-loader' }
    ]
  },

  plugins: PROD ? [
    new webpack.optimize.UglifyJsPlugin()
  ] : [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],

  watch: true,

  // docs: https://webpack.github.io/docs/node.js-api.html#compiler
  watchOptions: {
    aggregateTimeout: 300
  }
};
