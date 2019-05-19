
var dal = require('./dal'); // Data access layer
var loggers = require('../../services/logs/loggers');

var status = require('http-status-codes');

exports.getRecent = function (req, res, next) {
  // HTTP request handler

  var n = req.query.n;
  var beforeTime = req.query.beforeTime;

  try {

    // Turns n to NaN if not integer
    n = parseInt(n, 10);
    if (Number.isNaN(n)) {
      throw new Error('Not a number');
    }

    // Allow beforeTime to be empty string, meaning server now time.
    if (beforeTime === '') {
      beforeTime = (new Date()).toISOString();
    } else {
      // Throws RangeError if not valid time
      beforeTime = new Date(beforeTime).toISOString();
    }

  } catch (e) {
    return res.sendStatus(status.BAD_REQUEST);
  }

  dal.getRecent(n, beforeTime, function (err, events) {
    if (err) {
      return next(err);
    }

    // Success
    loggers.log(req.user.name + ' viewed latest events.');

    return res.json(events);
  });
};
