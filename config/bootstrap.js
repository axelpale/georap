// Code to be run on server start.

var local = require('./local');
var bcrypt = require('bcryptjs');

module.exports = function (db) {

  (function insertDefaultUser() {

    var user = {
      name: local.admin.username,
      email: local.admin.email,
      hash: bcrypt.hashSync(local.admin.password, 10)
    };

    // Ensure collection
    var users = db.create('users');

    // Ensure unique index
    users.ensureIndex({ email: 1 }, { unique: true }, function (err, result) {
      if (err) {
        // Documents in the collection makes this index impossible.
        console.error('config/bootstrap: ensureIndex error');
        console.error(err);
        return;
      }
      users.ensureIndex({ name: 1 }, { unique: true }, function (err, result) {
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
            if (err.code === 11000) {
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
