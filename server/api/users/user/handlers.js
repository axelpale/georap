const status = require('http-status-codes');
const dal = require('./dal');
const loggers = require('../../../services/logs/loggers');

exports.getOneWithEvents = function (req, res, next) {
  // Fetch single user
  //
  // Parameters:
  //   req.username
  //     string

  dal.getOneWithEvents(req.username, (err, user) => {
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

exports.getVisitedLocationIds = function (req, res, next) {
  // Response with an array of _id:s of all locations visited by the user.
  // If no locations or users found, responses with empty array [].

  dal.getVisitedLocationIds(req.username, (err, ids) => {
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
