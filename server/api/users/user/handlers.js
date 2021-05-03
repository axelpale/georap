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
