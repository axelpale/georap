// config/webpack.js

var webpack = require('webpack');
var path = require('path');
var local = require('./config/local');

var trimSlash = function (url) {
  return url.replace(/\/$/, '');
};

// compile js assets into a single bundle file
module.exports = {

  // Context: the directory for Webpack to look for assets.
  context: path.resolve(__dirname, './client'),

  // Entry: the main file that requires all others. Relative to the context.
  entry: './index.js',

  // Output: where to store the generated files.
  output: {
    // Directory to which the compiled static files will be stored.
    path: local.staticDir,
    // Root url from which the static files are served.
    // Add slash (and prevent doubles) so that hashed filenames
    // have proper root path (otherwise /assets34wfewijo34).
    publicPath: trimSlash(local.staticUrl) + '/',
    // The name of the bundle and its source maps. Relative to the output path.
    filename: './app.bundle.js',
    sourceMapFilename: '[file].map',
  },

  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      },
      {
        test: /\.ejs$/,
        loader: 'ejs-loader',
      },
      {
        test: /\.(jpe?g|gif|png)$/i,
        loader: 'file-loader',
      },
    ],
  },

  devtool: 'source-map',

  // Plugins depend on environment.
  // See http://stackoverflow.com/a/31228568/638546
  plugins: (local.env === 'production') ? [
    new webpack.optimize.UglifyJsPlugin(),
  ] : [
    new webpack.NoErrorsPlugin(),
  ],

  // Watch is not used because in 'development' env, webpack-dev-middleware
  // does the watching. In 'production' we want webpack to run only once.
  // watch: true,
};
