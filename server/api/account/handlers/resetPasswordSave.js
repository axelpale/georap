const status = require('http-status-codes');
const config = require('georap-config');
const db = require('georap-db');
const bcrypt = require('bcryptjs');
const loggers = require('../../../services/logs/loggers');

module.exports = function (req, res, next) {
  // Parameters:
  //   req.body
  //     Properties:
  //       password

  const password = req.body.password;
  const email = req.user.email;

  if (typeof password !== 'string' || typeof email !== 'string') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  // Hash the new password before storing it to database.
  bcrypt.hash(password, config.bcrypt.rounds, (err, newHash) => {

    if (err) {
      return next(err);
    }

    // Construct the query.
    const q = { email: email };
    const u = { $set: { hash: newHash } };

    // Collection
    const users = db.collection('users');

    users.findOneAndUpdate(q, u, (err2, user) => {

      if (err2) {
        return next(err2);
      }

      // If no user found.
      if (user === null) {
        return res.sendStatus(status.UNAUTHORIZED);
      }

      // Password changed successfully
      loggers.log(req.user.name + ' reset password.');

      return res.sendStatus(status.OK);
    });
  });
};
