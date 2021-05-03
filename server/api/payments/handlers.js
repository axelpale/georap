
const dal = require('./dal');

exports.create = function (req, res) {
  res.json({});
};

exports.createCorrection = function (req, res) {
  res.json({});
};

exports.getAll = function (req, res, next) {
  // Response with all payments.

  dal.getAll((err, payments) => {
    if (err) {
      return next(err);
    }

    return res.json(payments);
  });
};

exports.getBalances = function (req, res, next) {

  dal.getBalances((err, users) => {
    if (err) {
      return next(err);
    }

    return res.json(users);
  });
};

exports.getBalanceOfUser = function (req, res, next) {

  const u = req.username;

  dal.getBalanceOfUser(u, (err, balance) => {
    if (err) {
      return next(err);
    }

    return res.json(balance);
  });
};

exports.getAllOfUser = function (req, res, next) {
  const u = req.username;

  dal.getAllOfUser(u, (err, payments) => {
    if (err) {
      return next(err);
    }

    return res.json(payments);
  });
};
