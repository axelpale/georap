var config = require('tresdb-config');
var path = require('path');
var morgan = require('morgan');
var fse = require('fs-extra');
var fs = require('fs');

// Setup

// Ensure directory for access logs exist.
fse.ensureDirSync(config.logDir);

// Interface

exports.http = function () {
  // HTTP request will be written in a file.
  // See https://github.com/expressjs/morgan#write-logs-to-a-file
  //
  // Usage:
  //   var loggers = require('./logs/loggers')
  //   app.use(loggers.http())
  //

  // Log requests to a file. For that, create a write stream (in append mode)
  var p = path.join(config.logDir, 'access.log');
  var accessLogStream = fs.createWriteStream(p, { flags: 'a' });

  return morgan('common', {
    stream: accessLogStream,
  });
};

exports.log = function (msg) {
  var datetime = (new Date()).toISOString();
  console.log(datetime + ': ' + msg);
};
