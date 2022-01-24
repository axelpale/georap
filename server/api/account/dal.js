
const config = require('georap-config');
const db = require('georap-db');
const bcrypt = require('bcryptjs');

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

  const users = db.collection('users');

  const r = config.bcrypt.rounds;

  bcrypt.hash(password, r, (berr, pwdHash) => {
    if (berr) {
      return callback(berr);
    }

    users.insert({
      name: username,
      email: email,
      hash: pwdHash,
      role: 'basic', // TODO rename to writer
      createdAt: (new Date()).toISOString(),
      loginAt: (new Date()).toISOString(),
    }, (qerr) => {
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
  const users = db.collection('users');

  const q = { name: username };
  const u = {
    $set: {
      loginAt: (new Date()).toISOString(),
    },
  };

  users.updateOne(q, u, (err, result) => {
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
