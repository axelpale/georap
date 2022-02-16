
const config = require('georap-config');
const db = require('georap-db');
const bcrypt = require('bcryptjs');

module.exports = function (username, email, password, callback) {
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
      points: 0, // updated by worker
      points7days: 0, // updated by worker
      points30days: 0, // updated by worker
      points365days: 0, // updated by worker
      role: defaultRole,
      securityToken: '',
      flagsCreated: [], // updated by worker
      locationsCreated: 0, // updated by worker
      postsCreated: 0, // updated by worker
      locationsClassified: 0, // updated by worker
      commentsCreated: 0, // updated by worker
    }, (qerr) => {
      if (qerr) {
        return callback(qerr);
      }
      // User inserted successfully
      return callback();
    });
  });
};
