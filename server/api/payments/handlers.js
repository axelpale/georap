
var dal = require('./dal');
var status = require('http-status-codes');

exports.create = function (req, res) {
  res.json({});
};

exports.createCorrection = function (req, res) {
  res.json({});
};

exports.getAll = function (req, res) {
  // Response with all payments.

  dal.getAll(function (err, payments) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.json(payments);
  });
};

exports.getBalances = function (req, res) {

  dal.getBalances(function (err, users) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.json(users);
  });
};

exports.getBalanceOfUser = function (req, res) {

  var u = req.username;

  dal.getBalanceOfUser(u, function (err, balance) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.json(balance);
  });
};

exports.getAllOfUser = function (req, res) {
  var u = req.username;

  dal.getAllOfUser(u, function (err, payments) {
    if (err) {
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    return res.json(payments);
  });
};
