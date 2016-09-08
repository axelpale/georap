var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var local = require('./config/local');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

// Database
var mongoUrl = 'mongodb://localhost:27017/tresdb';
var db = require('monk')(mongoUrl);

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

io.on('connection', function (socket) {

  // Authentication
  socket.on('loginRequest', function (data, response) {

    // TODO
    // if no email or password provided...

    // Dummy Database
    var email = 'foo@bar.com';
    var hash = bcrypt.hashSync('baz', 10);
    // Dummy Database END

    var emailCandidate = data.email;
    var hashCandidateOk = bcrypt.compareSync(data.password, hash);

    if (emailCandidate === email && hashCandidateOk) {
      // Success
      response({
        token: jwt.sign({ isAdmin: false }, local.secret)
      });
    } else {
      // Authentication failure
      response({
        error: 'Invalid email or password'
      });
    }
  });

  // Locations
  socket.on('locationsRequest', function (data, response) {
    var token = data.token;
    jwt.verify(data.token, local.secret, function (err, payload) {
      if (err) {
        // Problems with token
        response({
          error: 'invalid-token'
        });
      } else {
        // Give all locations. TODO take payload into account
        response({
          locations: [
            {
              id: 23,
              name: 'Kalkkipetteri',
              lat: 60.189287,
              lng: 23.983326
            }
          ]
        });
      }
    });
  });
});
