
var dal = require('./dal');

exports.create = function (req, res) {
  res.json({});
};

exports.createCorrection = function (req, res) {
  res.json({});
};

exports.getAll = function (req, res, next) {
  // Response with all payments.

  dal.getAll(function (err, payments) {
    if (err) {
      return next(err);
    }

    return res.json(payments);
  });
};

exports.getBalances = function (req, res, next) {

  dal.getBalances(function (err, users) {
    if (err) {
      return next(err);
    }

    return res.json(users);
  });
};

exports.getBalanceOfUser = function (req, res, next) {

  var u = req.username;

  dal.getBalanceOfUser(u, function (err, balance) {
    if (err) {
      return next(err);
    }

    return res.json(balance);
  });
};

exports.getAllOfUser = function (req, res, next) {
  var u = req.username;

  dal.getAllOfUser(u, function (err, payments) {
    if (err) {
      return next(err);
    }

    return res.json(payments);
  });
};
