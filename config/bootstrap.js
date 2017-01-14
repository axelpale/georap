// Code to be run on server start.

var local = require('./local');
var bcrypt = require('bcryptjs');
var async = require('async');

var MONGO_ASCENDING = 1;

module.exports = function (db) {

  async.series([

    function ensureDefaultUser(next) {
      var users = db.collection('users');

      users.findOne({ name: local.admin.username }).then(function (user) {
        if (user) {
          // User exists. No need to create.
          return next();
        }

        // Create the default user
        var pwd = local.admin.password;
        var r = local.bcrypt.rounds;

        bcrypt.hash(pwd, r, function (err, hash) {
          if (err) {
            return next(err);
          }  // else

          var adminUser = {
            name: local.admin.username,
            email: local.admin.email,
            hash: hash,
            admin: true,
          };

          users.insert(adminUser).then(function () {
            console.log('Default user inserted.');
            return next();
          }).catch(function (err1) {
            return next(err1);
          });
        });
      }).catch(function (err) {
        return next(err);
      });
    },

    function createUserIndices(next) {
      var users = db.collection('users');

      // Ensure unique index
      var query = { email: MONGO_ASCENDING };

      users.ensureIndex(query, { unique: true }, function (err1) {
        if (err1) {
          // Documents in the collection makes this index impossible.
          return next(err1);
        }

        var query2 = { name: MONGO_ASCENDING };

        users.ensureIndex(query2, { unique: true }, function (err2) {
          if (err2) {
            // Documents in the collection makes this index impossible.
            return next(err2);
          }

          return next();
        });
      });
    },

    function createLocationIndices(next) {
      var locs = db.collection('locations');

      locs.ensureIndex({ geom: '2dsphere' }, {}, function (err1) {
        if (err1) {
          return next(err1);
        }

        locs.ensureIndex({ layer: 1 }, {}, function (err2) {
          if (err2) {
            return next(err2);
          }

          return next();
        });
      });
    },

  ], function afterSeries(err) {
    if (err) {
      console.error(err);
    }
  });
};
