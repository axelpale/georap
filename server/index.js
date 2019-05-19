/* eslint-disable max-statements */

var local = require('../config/local');
var http = require('http');
var path = require('path');
var fse = require('fs-extra');
var express = require('express');

var app = express();
var server = http.createServer(app);

var io = require('./services/io');
io.init(server);

var mailer = require('./services/mailer');
mailer.init();

var db = require('./services/db');

var webpack = require('webpack');
var webpackConfig = require('../webpack.config');

// Logging
var loggers = require('./services/logs/loggers');

// Routes
var router = require('./routes');

// Log environment
console.log('Starting TresDB in environment:', local.env);


// Database connection first

db.init(function (dbErr) {
  if (dbErr) {
    console.error('Failed to connect to MongoDB.');
    console.error(dbErr);
    return;
  }
  // Success
  console.log('Connected to MongoDB...');


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


  // Request logging
  // ---------------
  if (local.env === 'production') {
    app.use(loggers.http());
  }
  // ---------------
  // Request logging END


  // Webpack & Static assets
  // -------------
  if (local.env === 'development' || local.env === 'test') {
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
      // publicPath is required. Use same as in webpackConfig.
      // See https://github.com/webpack/webpack-dev-middleware
      publicPath: webpackConfig.output.publicPath,
      noInfo: false,  // Display build info at each build.
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
    app.use(local.staticUrl, express.static(local.staticDir));
    console.log('Serving static files from', local.staticUrl);
  }

  // Instance-specific static files are best copied without webpack
  // because webpack does not support dynamic paths well.
  (function copyCustomStatic(copyPaths) {
    copyPaths.forEach(function (pp) {
      fse.copy(pp[0], pp[1]);
    });
  }([
    [local.loginBackground, path.join(local.staticDir, 'images/login.jpg')],
  ]));
  // -------------
  // Static assets END


  // Uploaded files
  // --------------
  app.use(local.uploadUrl, express.static(local.uploadDir));
  console.log('Serving uploaded files from', local.uploadUrl);
  app.use(local.tempUploadUrl, express.static(local.tempUploadDir));
  console.log('Serving temporary files from', local.tempUploadUrl);
  // --------------
  // Uploaded files END


  // HTTP routes here
  app.use('/', router);

  // Socket.io routing
  io.get().on('connection', function (socket) {
    // Parameters:
    //   socket
    var datetime = (new Date()).toISOString();
    var clientIp = socket.client.conn.remoteAddress;
    var connIp = socket.conn.remoteAddress;
    var shakeIp = socket.handshake.address;
    var s = clientIp + ' ' + connIp + ' ' + shakeIp;
    console.log(datetime + ': New connection from ' + s);
  });

  // Override default error handler with a custom one to include date time.
  app.use(function (err, req, res, next) {
    // Fall back to Express default error handler if error occurs during
    // streaming. https://expressjs.com/en/guide/error-handling.html
    if (res.headersSent) {
      return next(err);
    }

    var datetime = (new Date()).toISOString();
    var logEntry = datetime + ': ' + err.stack;

    console.error(logEntry);
    var INTERNAL_SERVER_ERROR = 500;
    res.status(INTERNAL_SERVER_ERROR).send('Error: ' + err.message);
  });
});
