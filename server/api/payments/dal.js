var db = require('../../services/db');
var _ = require('lodash');
var clone = require('clone');

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

exports.getBalanceOfUser = function (userId, callback) {
  // Parameters:
  //   userId
  //     object id
  //   callback
  //     function (err, balance)
  //       err
  //       balance
  //         integer, cents

  var coll = db.collection('payments');

  // Find most recent payment and return balanceAfter value
  var cursor = coll.find({ userId: userId }).sort({ time: 1 }).limit(1);

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

exports.getPaymentsOfUser = function (username, callback) {

  var coll = db.collection('payments');
  var cursor = coll.find({ account: username }).sort({ time: 1 });

  cursor.toArray(function (err, payments) {
    if (err) {
      return callback(err);
    }

    return callback(null, payments);
  });
};

exports.hasActiveSubscription = function (username, callback) {
  // Calls back with true if less than 30 days (or other subscription period)
  // is passed from the previous subscription fee.

  //var MONTH = 30 * 24 * 60 * 60 * 1000;
};

exports.ensureActiveSubscription = function (username, callback) {
  // If user does not have active subscription (period has ended), try
  // to renew the subscription by making a payment from the user's account.
  // Call back with an Insufficient Funds error if no active subscription and
  // not enough funds in account to pay the subscription.
}
