
var local = require('../../../config/local');

var morgan = require('morgan');
var winston = require('winston');
var mkdirp = require('mkdirp');
var path = require('path');
var fs = require('fs');

// Ensure directory for logs exist.
mkdirp.sync(local.logDir);

exports.http = function () {
  // HTTP request will be written in a file.
  // See https://github.com/expressjs/morgan#write-logs-to-a-file
  //
  // Usage:
  //   var loggers = require('./logs/loggers')
  //   app.use(loggers.http())
  //

  // Log requests to a file. For that, create a write stream (in append mode)
  var p = path.join(local.logDir, 'access.log');
  var accessLogStream = fs.createWriteStream(p, { flags: 'a' });

  return morgan('common', {
    stream: accessLogStream,
  });
};

// Setup Winston default logger to log into a file
//
// Usage:
//   var winston = require('winston')
//   winston.error(err)
//
var p = path.join(local.logDir, 'error.log');
winston.add(winston.transports.File, { filename: p });
winston.level = 'info';
