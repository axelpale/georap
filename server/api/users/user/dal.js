var db = require('tresdb-db');
const config = require('tresdb-config');
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
      // Deleted visits do not count.
      return ent.deleted === false;
    }).forEach(function (ent) {
      if (ent.flags.indexOf('visit') >= 0) {
        visits.add(ent.locationId);
      }
    });

    return callback(null, Array.from(visits));
  });
};

exports.getFlags = (username, callback) => {
  // Parameters
  //   username
  //   callback
  //     fn (err, flagsObj) where
  //       flagsObj: loc id -> flags by the user
  //

  db.collection('entries').aggregate([
    {
      $match: {
        user: username,
        deleted: false,
        flags: {
          $ne: [],
        },
      },
    },
    {
      $project: {
        locationId: 1,
        flags: 1,
      },
    },
    {
      // Deconstruct flags
      $unwind: '$flags',
    },
    {
      $group: {
        _id: '$locationId',
        flags: {
          $addToSet: '$flags',
        },
      },
    },
  ]).toArray((err, flags) => {
      if (err) {
        return callback(err);
      }

      // // Init
      // const flags = config.entryFlags.reduce((acc, flag) => {
      //   acc[flag] = [];
      //   return acc;
      // }, {});
      //
      // // Collect
      // entries.forEach((entry) => {
      //   for (let i = 0; i < entry.flags.length; i += 1) {
      //     flags[entry.flags[i]].push(entry.locationId);
      //   }
      // });

      const idToFlags = flags.reduce((acc, flag) => {
        acc[flag._id] = flag.flags;
        return acc;
      }, {});

      return callback(null, idToFlags);
    });
};
