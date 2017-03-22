var db = require('../../services/db');
var usersDal = require('../users/dal');
var _ = require('lodash');
var clone = require('clone');
var async = require('async');

exports.createPayment = function (params, callback) {
  // Parameters:
  //   params:
  //     account
  //       username of the account holder, whose balance is being modified
  //     author
  //       username of the admin, who created the payment.
  //       If the payment is automatic, use the default admin.
  //     balanceBefore
  //       integer, cents
  //     balanceAfter
  //       integer, cents
  //     type, any of
  //       monthly_fee
  //         automatic reduction of balance due to subscription
  //       deposit
  //         authored addition of payment, from real cash or bank transaction
  //       correction
  //         authored correction of a payment
  //     data:
  //       paymentId (required if type=correction)
  //         object id
  //       description (required if type=correction)
  //         string
  //   callback
  //     function (err)

  var p = clone(params);

  if (!_.contains(['monthly_fee', 'deposit', 'correction'], p.type)) {
    throw new Error('invalid payment type: ' + p.type);
  }

  if (p.type === 'correction') {
    if (!p.data.hasOwnProperty('paymentId') ||
        !p.data.hasOwnProperty('description')) {
      throw new Error('invalid correction data');
    }
  }

  p.time = (new Date()).toISOString();

  var coll = db.collection('payments');

  coll.insertOne(p, function (err) {
    if (err) {
      return callback(err);
    }

    return callback();
  });
};

exports.createCorrection = function () {
  // noop
};

exports.getAll = function (callback) {
  // Get payments in time order, most recent first
  //
  // Parameters:
  //   callback
  //     function (err, payments)

  var coll = db.collection('payments');
  var cursor = coll.find().sort({ time: -1 });

  cursor.toArray(function (err, payments) {
    if (err) {
      return callback(err);
    }

    return callback(null, payments);
  });
};

exports.getBalanceOfUser = function (username, callback) {
  // Parameters:
  //   username
  //     string
  //   callback
  //     function (err, balance)
  //       err
  //       balance
  //         integer, cents

  var coll = db.collection('payments');

  // Find most recent payment and return balanceAfter value
  var cursor = coll.find({ name: username }).sort({ time: 1 }).limit(1);

  cursor.toArray(function (err, payments) {
    if (err) {
      return callback(err);
    }

    if (payments.length === 0) {
      return callback(null, 0);
    }

    var latest = payments[0];

    return callback(null, latest.balanceAfter);
  });
};

exports.getBalances = function (callback) {
  // Get users and their balances
  //
  // Parameters:
  //   callback
  //     function (err, usersWithBalances)

  usersDal.getAll(function (err, users) {
    if (err) {
      return callback(err);
    }

    async.map(users, function iteratee(u, done) {
      exports.getBalanceOfUser(u.name, function (err2, balance) {
        return done(null, {
          _id: u._id,
          name: u.name,
          balance: balance,
        });
      });
    }, function (err3, results) {
      if (err3) {
        return callback(err3);
      }

      return callback(null, results);
    });
  });
};

exports.getPaymentsOfUser = function (username, callback) {
  // Get payments in time order, newest first.
  //
  // Parameters:
  //   username
  //   callback
  //     function (err, payments)

  var coll = db.collection('payments');
  var cursor = coll.find({ account: username }).sort({ time: -1 });

  cursor.toArray(function (err, payments) {
    if (err) {
      return callback(err);
    }

    return callback(null, payments);
  });
};

exports.getSecondsToExpiration = function (username, callback) {
  // Calls back with a number of seconds to subscription expiration.

  return callback(new Error('not implemented'));
};

exports.hasActiveSubscription = function (username, callback) {
  // Calls back with true if less than 30 days (or other subscription period)
  // is passed from the previous subscription fee.

  //var MONTH = 30 * 24 * 60 * 60 * 1000;

  return callback(new Error('not implemented'));
};

exports.ensureActiveSubscription = function (username, callback) {
  // If user does not have active subscription (period has ended), try
  // to renew the subscription by making a payment from the user's account.
  // Call back with an Insufficient Funds error if no active subscription and
  // not enough funds in account to pay the subscription.

  return callback(new Error('not implemented'));
};
