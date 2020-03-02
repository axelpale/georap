var local = require('./config/local');

// compile js assets into a single bundle file
module.exports = {

  // Entry: the main file that requires all others.
  entry: './client/index.js',
  // Output: where to store the generated files.
  output: {
    // Directory to which the compiled static files will be stored.
    path: local.staticDir,
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
