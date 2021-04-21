var status = require('http-status-codes');
var dal = require('./dal');
var loggers = require('../../../services/logs/loggers');

exports.getOneWithEvents = function (req, res, next) {
  // Fetch single user
  //
  // Parameters:
  //   req.username
  //     string

  dal.getOneWithEvents(req.username, function (err, user) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.sendStatus(status.NOT_FOUND);
    }

    loggers.log(req.user.name + ' viewed user ' + req.username + '.');

    return res.json(user);
  });
};

exports.getOneWithBalanceAndPayments = function (req, res, next) {
  // Fetch single user and patch it with balance and payments properties.
  //
  // Parameters:
  //   req.username
  //     string

  dal.getOneWithBalanceAndPayments(req.username, function (err, user) {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.sendStatus(status.NOT_FOUND);
    }

    return res.json(user);
  });
};

exports.getVisitedLocationIds = function (req, res, next) {
  // Response with an array of _id:s of all locations visited by the user.
  // If no locations or users found, responses with empty array [].

  dal.getVisitedLocationIds(req.username, function (err, ids) {
    if (err) {
      return next(err);
    }

    // Assert
    if (!Array.isArray(ids)) {
      throw new Error('invalid location id array');
    }

    return res.json(ids);
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
