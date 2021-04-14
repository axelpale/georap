
var dal = require('./dal'); // Data access layer
var loggers = require('../../services/logs/loggers');

var status = require('http-status-codes');

exports.getRecent = function (req, res, next) {
  // HTTP request handler

  const MAX_LIMIT = 100;
  const params = Object.assign({
    skip: 0,
    limit: 10,
  }, req.query);

  const skip = parseInt(params.skip, 10);
  const limit = parseInt(params.limit, 10);

  if (isNaN(skip)) {
    return res.status(status.BAD_REQUEST).send('Invalid argument: skip');
  }
  if (isNaN(limit)) {
    return res.status(status.BAD_REQUEST).send('Invalid argument: limit');
  }
  if (limit > MAX_LIMIT) {
    return res.status(status.BAD_REQUEST).send('Too large limit: ' + limit);
  }

  dal.getRecent({
    skip: skip,
    limit: limit,
  }, function (err, events) {
    if (err) {
      return next(err);
    }

    // Success
    loggers.log(req.user.name + ' viewed latest events.');

    return res.json(events);
  });
};
