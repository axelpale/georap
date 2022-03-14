const status = require('http-status-codes');
const dal = require('./dal');
const loggers = require('../../../services/logs/loggers');

exports.getOne = (req, res, next) => {
  // Fetch single user
  //
  // Parameters:
  //   req.username
  //     string
  //
  dal.getOne(req.username, (err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.sendStatus(status.NOT_FOUND);
    }

    if (req.user) {
      loggers.log(req.user.name + ' viewed user ' + req.username + '.');
    }

    return res.json(user);
  });
};

exports.getEvents = (req, res, next) => {
  // Fetch events for single user.
  //
  // Parameters
  //   req.username
  //   req.query.skip
  //   req.query.limit
  //
  dal.getEvents({
    username: req.username,
    skip: req.query.skip,
    limit: req.query.limit,
  }, (err, events) => {
    if (err) {
      return next(err);
    }

    return res.json({
      events: events,
    });
  });
};

exports.getFlags = (req, res, next) => {
  // Response:
  //   {
  //     flags: {
  //       <locationId>: <array of flags by the user>,
  //       ...
  //     }
  //   }
  //
  dal.getFlags(req.username, (err, flagsObj) => {
    if (err) {
      return next(err);
    }

    return res.json({
      flags: flagsObj,
    });
  });
};
