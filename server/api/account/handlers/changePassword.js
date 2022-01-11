const status = require('http-status-codes');
const config = require('georap-config');
const db = require('georap-db');
const bcrypt = require('bcryptjs');
const loggers = require('../../../services/logs/loggers');

module.exports = function (req, res, next) {
  // Parameters:
  //   req.body
  //     Required keys:
  //       currentPassword
  //       newPassword

  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;
  const email = req.user.email;

  // Validate data
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  // User is logged in. Good. Find if user with this email still exists.
  const users = db.collection('users');

  users.findOne({ email: email }, (err, user) => {

    if (err) {
      // User fetch for email and password check failed.
      // Connection to database was lost or something.
      return next(err);
    }

    // If no correct email found.
    if (user === null) {
      return res.sendStatus(status.UNAUTHORIZED);
    }  // else

    // Test if the given current password is correct
    bcrypt.compare(currentPassword, user.hash, (err2, match) => {

      if (err2) {
        return next(err2);
      }  // else

      if (!match) {
        return res.sendStatus(status.UNAUTHORIZED);
      }  // else

      // Success, current passwords match
      // Hash the new password before storing it to database.
      const r = config.bcrypt.rounds;

      bcrypt.hash(newPassword, r, (err3, newHash) => {

        if (err3) {
          return next(err3);
        }  // else

        const q = { email: email };
        const u = { $set: { hash: newHash } };

        // Ready to change password. Update hash in database.
        users.findOneAndUpdate(q, u, (err4, updatedUser) => {

          if (err4) {
            return next(err4);
          }

          // Check if user still exists
          if (updatedUser === null) {
            return res.sendStatus(status.UNAUTHORIZED);
          }  // else
          // Password changed successfully

          loggers.log(req.user.name + ' changed password.');

          return res.sendStatus(status.OK);
        });
      });
    });
  });
};
