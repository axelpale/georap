
var local = require('../../../config/local');
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

  var r = local.bcrypt.rounds;

  bcrypt.hash(password, r, function (berr, pwdHash) {

    if (berr) {
      return callback(berr);
    }

    users.insert({
      name: username,
      email: email,
      hash: pwdHash,
      admin: false,
      status: 'active',  // 'deactivated'
    }, function (qerr) {

      if (qerr) {
        return callback(qerr);
      }

      // User inserted successfully
      return callback();
    });
  });
};
