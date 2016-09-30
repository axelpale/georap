// Code to be run on server start.

var local = require('./local');
var bcrypt = require('bcryptjs');

var MONGO_DUPLICATE_KEY_ERROR = 11000;
var MONGO_ASCENDING = 1;

module.exports = function (db) {

  (function insertDefaultUser() {

    var user = {
      name: local.admin.username,
      email: local.admin.email,
      hash: bcrypt.hashSync(local.admin.password, local.bcrypt.rounds),
      admin: true
    };

    // Ensure collection
    var users = db.create('users');

    // Ensure unique index
    var query = { email: MONGO_ASCENDING };
    users.ensureIndex(query, { unique: true }, function (err, result) {
      if (err) {
        // Documents in the collection makes this index impossible.
        console.error('config/bootstrap: ensureIndex error');
        console.error(err);
        return;
      }
      var query2 = { name: MONGO_ASCENDING };
      users.ensureIndex(query2, { unique: true }, function (err, result) {
        if (err) {
          // Documents in the collection makes this index impossible.
          console.error('config/bootstrap: ensureIndex error');
          console.error(err);
          return;
        }

        users.insert(user)
          .then(function (inserted) {
            console.log('Default user inserted');
          })
          .catch(function (err) {
            if (err.code === MONGO_DUPLICATE_KEY_ERROR) {
              // User with this email already exists. Nice :)
            } else {
              console.error('config/bootstrap: insert error');
              console.error(err);
            }
          });
      });
    });


  }());
};
