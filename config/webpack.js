// config/webpack.js

var webpack = require('webpack');
var path = require('path');

// compile js assets into a single bundle file
module.exports.webpack = {
  options: {
    devtool: 'eval',
    entry: [
      './assets/js',
    ],
    output: {
      path: path.resolve(__dirname, '../.tmp/public/js'),
      filename: 'app.bundle.js'
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
    ]
  },

  // docs: https://webpack.github.io/docs/node.js-api.html#compiler
  watchOptions: {
    aggregateTimeout: 300
  }
};
