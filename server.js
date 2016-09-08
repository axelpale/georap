var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000, function () {
  console.log('Listening on port 3000...');
});

// Webpack development middleware
// ------------------------------
// The following middleware is only for development.
// It serves the static file assets on publicPath in a manner similar
// to express.static(publicPath). It also watches the assets for changes and
// compiles them on change on background.
//
// To serve static files in production, use:
//     app.use(express.static('./.tmp/public'));
// To compile assets for production, run webpack from the command line:
//     $ webpack --config ./config/webpack.js
var webpack = require('webpack');
var webpackMiddleware = require('webpack-dev-middleware');
var webpackConfig = require('./config/webpack');
app.use(webpackMiddleware(webpack(webpackConfig), {
  noInfo: true,
  publicPath: '/',
  stats: { colors: true }
}));
// ------------------------------
// Webpack development middleware END

//app.get('/', function (req, res) {
//  res.send('Hello World!');
//});

io.on('connection', function (socket) {

  // Authentication
  socket.on('loginRequest', function (data, response) {
    if (data.email === 'foo@bar.com' && data.password === 'baz') {
      response({
        token: '123456789'
      });
    } else {
      response({
        error: 'Invalid email or password'
      });
    }
  });
});
