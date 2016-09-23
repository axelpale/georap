// config/webpack.js

var webpack = require('webpack');
var path = require('path');
var local = require('./local');

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

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],

  watch: true,

  // docs: https://webpack.github.io/docs/node.js-api.html#compiler
  watchOptions: {
    aggregateTimeout: 300
  }
};
