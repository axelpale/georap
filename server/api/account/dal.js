
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
  //
  const users = db.collection('users');

  const r = config.bcrypt.rounds;
  const defaultRole = config.defaultRole;

  bcrypt.hash(password, r, (berr, pwdHash) => {
    if (berr) {
      return callback(berr);
    }

    const now = (new Date()).toISOString();

    users.insert({
      createdAt: now,
      deleted: false,
      email: email,
      hash: pwdHash,
      loginAt: now,
      name: username,
      points: 0,
      points7days: 0,
      points30days: 0,
      points365days: 0,
      role: defaultRole,
      securityToken: '',
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
