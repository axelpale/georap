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

var db = require('tresdb-db');

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

  app.use(local.staticUrl, express.static(local.staticDir));
  console.log('Serving static files from', local.staticUrl);

  // Instance-specific static files are best copied without webpack
  // because webpack does not support dynamic paths well.
  var imagesDir = path.resolve(__dirname, '..', 'client', 'images');
  var configDir = path.resolve(__dirname, '..', 'config');
  var markersDir = path.join(configDir, 'images', 'markers');
  (function copyCustomStatic(copyPaths) {
    copyPaths.forEach(function (pp) {
      fse.copy(pp[0], pp[1]);
    });
  }([
    [local.loginBackground, path.join(local.staticDir, 'images', 'login.jpg')],
    [imagesDir, path.join(local.staticDir, 'images')],
    [markersDir, path.join(local.staticDir, 'images', 'markers')],
  ]));
  console.log('Copying custom static files to', local.staticDir);
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
  io.get().on('connection', function () {
    // Parameters:
    //   socket
    loggers.log('New connection.');
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
