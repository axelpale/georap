
var config = require('tresdb-config');
var db = require('tresdb-db');
var bcrypt = require('bcryptjs');

exports.createUser = function (username, email, password, callback) {
  // Create non-admin active user. Does not check if user exists.
  //
  // Parameters:
  //   username
  //     string
  //   email
  //     string
  //   password
  //     string
  //   callback
  //     function (err)

  var users = db.collection('users');

  var r = config.bcrypt.rounds;

  bcrypt.hash(password, r, function (berr, pwdHash) {
    if (berr) {
      return callback(berr);
    }

    users.insert({
      name: username,
      email: email,
      hash: pwdHash,
      admin: false,
      status: 'active',  // options. 'active' | 'deactivated',
      createdAt: (new Date()).toISOString(),
      loginAt: (new Date()).toISOString(),
    }, function (qerr) {
      if (qerr) {
        return callback(qerr);
      }
      // User inserted successfully
      return callback();
    });
  });
};

exports.markLogin = function (username, callback) {
  // Set last login time to the current time.
  // If user is not found, fails silently.
  //
  // Parameters:
  //   username
  //     string
  //   callback
  //     function (err)
  //
  var users = db.collection('users');

  var q = { name: username };
  var u = {
    $set: {
      loginAt: (new Date()).toISOString(),
    },
  };

  users.updateOne(q, u, function (err, result) {
    if (err) {
      return callback(err);
    }

    if (result.matchedCount === 0) {
      // No users found
      return callback();
    }

    return callback();
  });
};
