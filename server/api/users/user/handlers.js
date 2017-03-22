
var status = require('http-status-codes');

var dal = require('./dal');

exports.getOneWithEvents = function (req, res) {
  // Fetch single user
  //
  // Parameters:
  //   req.username
  //     string

  dal.getOneWithEvents(req.username, function (err, user) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    if (!user) {
      return res.sendStatus(status.NOT_FOUND);
    }

    return res.json(user);
  });
};

exports.getOneWithBalanceAndPayments = function (req, res) {
  // Fetch single user and patch it with balance and payments properties.
  //
  // Parameters:
  //   req.username
  //     string

  dal.getOneWithBalanceAndPayments(req.username, function (err, user) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    if (!user) {
      return res.sendStatus(status.NOT_FOUND);
    }

    return res.json(user);
  });
};
