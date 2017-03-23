var db = require('../../../services/db');
var eventsDal = require('../../events/dal');
var paymentsDal = require('../../payments/dal');
var clone = require('clone');
var _ = require('lodash');

exports.getOne = function (username, callback) {
  // Get single user without anything extra. The result does not have
  // the properties hash and email.
  //
  // Parameters:
  //   username
  //     string
  //   callback
  //     function (err, user), user === null if no user found

  var usersColl = db.get().collection('users');
  var proj = {
    hash: false,
    email: false,
  };

  usersColl.findOne({ name: username }, proj, function (err, doc) {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(null, null);
    }

    return callback(null, doc);
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
  // Find each location_entry_created that has a visit.
  // Find each location_unproved_visit_created
  // Make ids into a list, remove duplicates.

  if (typeof username !== 'string') {
    return callback(new Error('invalid username:' + username));
  }

  var q = {
    $or: [
      {
        user: username,
        type: 'location_entry_created',
        'data.isVisit': true,
      },
      {
        user: username,
        type: 'location_unproved_visit_created',
      },
    ],
  };

  var proj = {
    locationId: 1,
  };

  var evcoll = db.collection('events');
  evcoll.find(q, proj).toArray(function (err, evs) {
    if (err) {
      return callback(err);
    }

    // Convert to list of location ids
    var locationIds = evs.map(function (ev) {
      return ev.locationId;
    });

    // Remove duplicates
    var uniqLocIds = _.uniq(locationIds);

    // Return with array of ids
    return callback(null, uniqLocIds);
  });
};
