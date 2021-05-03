const config = require('georap-config');
const path = require('path');
const morgan = require('morgan');
const fse = require('fs-extra');
const fs = require('fs');

// Setup

// Ensure directory for access logs exist.
// eslint-disable-next-line no-sync
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
  const p = path.join(config.logDir, 'access.log');
  const accessLogStream = fs.createWriteStream(p, { flags: 'a' });

  return morgan('common', {
    stream: accessLogStream,
  });
};

exports.log = function (msg) {
  const datetime = (new Date()).toISOString();
  console.log(datetime + ': ' + msg);
};
