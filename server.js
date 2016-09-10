var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var local = require('./config/local');
var jwt = require('jsonwebtoken');


// Controllers setup
var controllers = {
  auth: require('./api/controllers/auth'),
  locations: require('./api/controllers/locations')
};


// Database
var mongoUrl = 'mongodb://localhost:27017/tresdb';
var db = require('monk')(mongoUrl);
db.then(function () {
  console.log('Connected to MongoDB...');
});


// Start the server.
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


// Socket.io routing

io.on('connection', function (socket) {
  // Authentication
  socket.on('auth/login', function (data, res) {
    controllers.auth.login(db, data, res);
  });

  // Locations
  socket.on('locations/get', function (data, res) {
    controllers.locations.get(db, data, res);
  });
});


// Populate database

var bootstrap = require('./config/bootstrap');
bootstrap(db);
