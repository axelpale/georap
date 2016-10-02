// Code to be run on server start.

var local = require('./local');
var bcrypt = require('bcryptjs');

var MONGO_DUPLICATE_KEY_ERROR = 11000;
var MONGO_ASCENDING = 1;

module.exports = function (db) {

  (function insertDefaultUser() {

    var pwd = local.admin.password;
    var r = local.bcrypt.rounds;

    bcrypt.hash(pwd, r, function (err0, hash) {
      if (err0) {
        throw err0;
      }  // else

      var user = {
        name: local.admin.username,
        email: local.admin.email,
        hash: hash,
        admin: true,
      };

      // Ensure collection
      var users = db.create('users');

      // Ensure unique index
      var query = { email: MONGO_ASCENDING };

      users.ensureIndex(query, { unique: true }, function (err1) {
        if (err1) {
          // Documents in the collection makes this index impossible.
          console.error('config/bootstrap: ensureIndex error');
          console.error(err1);

          return;
        }

        var query2 = { name: MONGO_ASCENDING };

        users.ensureIndex(query2, { unique: true }, function (err2) {
          if (err2) {
            // Documents in the collection makes this index impossible.
            console.error('config/bootstrap: ensureIndex error');
            console.error(err2);

            return;
          }

          users.insert(user)
          .then(function () {
            console.log('Default user inserted.');
          })
          .catch(function (err3) {
            if (err3.code === MONGO_DUPLICATE_KEY_ERROR) {
              // User with this email already exists. Nice :)
            } else {
              console.error('config/bootstrap: insert error');
              console.error(err3);
            }
          });
        });
      });
    });  // bcrypt hash

  }());  // insert default user END
};
