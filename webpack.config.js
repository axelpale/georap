var config = require('tresdb-config');

// compile js assets into a single bundle file
module.exports = {

  // Entry: the main file that requires all others.
  entry: './client/index.js',
  // Output: where to store the generated files.
  output: {
    // Directory to which the compiled static files will be stored.
    path: config.staticDir,
    // Relative URL from where the bundle chunks will be read.
    publicPath: config.staticUrl + '/',
    // The name of the bundle and its source maps.
    filename: 'app.bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.ejs$/,
        use: 'ejs-loader',
      },
    ],
  },

  mode: 'production', // in {development, production}
  devtool: 'source-map',
};
