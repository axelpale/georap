var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var local = require('./config/local');


// Controllers setup
var controllers = {
  auth: require('./api/controllers/auth'),
  locations: require('./api/controllers/locations')
};


// Database
var db = require('monk')(local.mongo.url);
db.then(function () {
  console.log('Connected to MongoDB...');
}).catch(function (err) {
  console.log('Connection to MongoDB failed.');
  console.error(err);
});


// Email transporter setup and verification.
var mailer = nodemailer.createTransport(local.smtp);
mailer.verify(function (err, success) {
  if (err) {
    console.log('Connection to mail server failed:');
    console.log(err);
  } else {
    console.log('Connected to mail server...');
  }
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

  // Domain name is required by some handlers, for example
  // when a link is sent via email. It does not matter if
  // the connection is transported via polling or websockets,
  // the host stays the same.
  var host = socket.request.headers.host;
  console.log('New connection from app hosted at', host);

  // Authentication
  socket.on('auth/login', function (data, res) {
    controllers.auth.login(db, data, res);
  });

  // Change password
  socket.on('auth/changePassword', function (data, res) {
    controllers.auth.changePassword(db, data, res);
  });

  // Password reset
  socket.on('auth/sendResetPasswordEmail', function (data, res) {
    controllers.auth.sendResetPasswordEmail(db, mailer, host, data, res);
  });
  socket.on('auth/resetPassword', function (data, res) {
    controllers.auth.resetPassword(db, data, res);
  });

  // Invitation & post-invite sign up
  socket.on('auth/sendInviteEmail', function (data, res) {
    controllers.auth.sendInviteEmail(db, mailer, host, data, res);
  });
  socket.on('auth/signup', function (data, res) {
    controllers.auth.signup(db, data, res);
  });

  // Locations
  socket.on('locations/get', function (data, res) {
    controllers.locations.get(db, data, res);
  });
});


// Populate database

var bootstrap = require('./config/bootstrap');
bootstrap(db);
