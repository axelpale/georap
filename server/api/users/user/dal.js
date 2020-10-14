/* globals Set */

var db = require('tresdb-db');
var entriesDal = require('../../entries/dal');
var eventsDal = require('../../events/dal');
var paymentsDal = require('../../payments/dal');
var clone = require('clone');

exports.getOne = function (username, callback) {
  // Get single user without anything extra. The result does not have
  // the properties hash and email.
  //
  // Parameters:
  //   username
  //     string
  //   callback
  //     function (err, user), user === null if no user found

  var usersColl = db.collection('users');
  var proj = {
    hash: false,
    email: false,
  };

  usersColl
    .findOne({ name: username }, { projection: proj })
    .then(function (doc) {
      if (!doc) {
        return callback(null, null);
      }
      return callback(null, doc);
    })
    .catch(function (err) {
      return callback(err);
    });
};

exports.getOneWithEvents = function (username, callback) {
  // Get single user
  //
  // Parameters:
  //   username
  //     string
  //   callback
  //     function (err, user)
  //       err null and user null if no user found
  //

  exports.getOne(username, function (err, doc) {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(null, null);
    }

    var num = 20;
    var before = (new Date()).toISOString();

    eventsDal.getRecentOfUser(username, num, before, function (err2, docs) {
      if (err2) {
        return callback(err2);
      }

      doc.events = docs;

      return callback(null, doc);
    });

  });
};

exports.getOneWithBalanceAndPayments = function (username, callback) {

  exports.getOne(username, function (err, doc) {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(null, null);
    }

    // Clone to avoid cache modification
    var user = clone(doc);

    paymentsDal.getBalanceOfUser(doc._id, function (err2, balance) {
      if (err2) {
        return callback(err2);
      }

      user.balance = balance;

      paymentsDal.getPaymentsOfUser(doc._id, function (err3, payments) {
        if (err3) {
          return callback(err3);
        }

        user.payments = payments;

        return callback(null, user);
      });
    });
  });
};

exports.getVisitedLocationIds = function (username, callback) {
  //

  if (typeof username !== 'string') {
    return callback(new Error('invalid username:' + username));
  }

  entriesDal.getAllOfUser(username, function (err, ents) {

    if (err) {
      return callback(err);
    }

    // Mapping from location ids to the number of visits.
    var visits = new Set();

    ents.filter(function (ent) {
      // Future proof
      return ent.type === 'location_entry';
    }).forEach(function (ent) {
      if (ent.data.isVisit) {
        visits.add(ent.locationId);
      }
    });

    return callback(null, Array.from(visits));
  });
};
