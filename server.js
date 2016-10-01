var express = require('express');
var app = express();
var server = require('http').Server(app);  // eslint-disable-line new-cap
var io = require('socket.io')(server);
var nodemailer = require('nodemailer');
var local = require('./config/local');
var monk = require('monk');

var webpack = require('webpack');
var webpackConfig = require('./config/webpack');

// Run immediately after server is up.
var bootstrap = require('./config/bootstrap');

var AuthController = require('./api/controllers/auth');
var LocationsController = require('./api/controllers/locations');

// Controllers setup
var controllers = {
  auth: AuthController,
  locations: LocationsController,
};


// Log environment
console.log('Starting TresDB in environment:', app.get('env'));


// Database

var db = monk(local.mongo.url);

db.then(function () {
  console.log('Connected to MongoDB...');
}).catch(function (err) {
  console.log('Connection to MongoDB failed.');
  console.error(err);
});


// Email transporter setup and verification.

var mailer = nodemailer.createTransport(local.smtp);

mailer.verify(function (err) {
  if (err) {
    console.log('Connection to mail server failed:');
    console.log(err);
  } else {
    console.log('Connected to mail server...');
  }
});


// Start the server.

server.listen(local.port, function () {
  console.log('Express listening on port ' + local.port + '...');
});


// Security best practices
// -----------------------
// https://expressjs.com/en/advanced/best-practice-security.html

// Do not tell we are using Express.
app.disable('x-powered-by');

// -----------------------
// Security best practices END


// Static assets
// -------------
if (local.env === 'development') {
  // Webpack development middleware
  //
  // The following middleware is only for development.
  // It serves the static file assets on publicPath in a manner similar
  // to express.static(publicPath). It also watches the assets for changes and
  // compiles them on change on background.
  //
  // To serve static files in production, use:
  //     app.use(express.static('./.tmp/public'));
  // To compile assets for production, run webpack from the command line:
  //     $ webpack --config ./config/webpack.js

  // eslint-disable-next-line global-require
  var webpackMiddleware = require('webpack-dev-middleware');

  app.use(webpackMiddleware(webpack(webpackConfig), {
    noInfo: true,
    publicPath: '/',
    stats: { colors: true },
  }));
  console.log('Webpack listening for file changes...');

} else {
  // In production, we run webpack once and serve the files.
  // The first run builds the initial set of files. The subsequent
  // runs append to that. Thus, serving static files before the build
  // finishes is not a problem.
  console.log('Building static assets...');
  webpack(webpackConfig, function (err, stats) {
    if (err || stats.hasErrors()) {
      if (err) {
        throw err;
      }  // else
      console.log(stats.toString({
        chunks: true,
        colors: true,
      }));
      throw new Error('Error when building static assets.');
    }  // else
    if (stats.hasWarnings()) {
      console.log('Built static assets with warnings.');
    } else {
      console.log('Built static assets successfully.');
    }
    console.log(stats.toString({
      chunks: false,
      colors: true,
    }));
    // See https://webpack.github.io/docs/node.js-api.html#error-handling
  });
  app.use(express.static(local.staticDir));
  console.log('Serving static files in', local.staticDir);
}
// -------------
// Static assets END


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

bootstrap(db);
