const status = require('http-status-codes');
const config = require('georap-config');
const db = require('georap-db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateAuthToken = require('../lib/generateAuthToken');
const loggers = require('../../../services/logs/loggers');

module.exports = function (req, res, next) {
  // Parameters:
  //   req.params.key
  //   req.body.password
  //   req.body.securityCode
  //

  const securityCode = req.params.code;
  const password = req.body.password;
  const username = req.user.name;

  if (typeof password !== 'string' || typeof securityCode !== 'string') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  // Construct the query.
  const q = { name: username };

  db.collection('users').findOne(q, (err, user) => {
    if (err) {
      return next(err);
    }

    // Does user exist.
    if (user === null) {
      return res.sendStatus(status.UNAUTHORIZED);
    }

    // Do passwords match
    bcrypt.compare(password, user.hash, (err2, match) => {
      if (err2) {
        return next(err2);
      }

      // Do password match
      if (!match) {
        return res.sendStatus(status.UNAUTHORIZED);
      }

      // Check that given security code matches the stored token.
      jwt.verify(user.securityToken, config.secret, (errj, decoded) => {
        if (errj) {
          // Probably expired token
          return res.sendStatus(status.UNAUTHORIZED);
        }

        // Do the codes match
        if (securityCode !== decoded.securityCode) {
          return res.sendStatus(status.UNAUTHORIZED);
        }

        // The new email was stored into the token
        const newEmail = decoded.newEmail;

        // Change the email address and reset the token.
        db.collection('users').updateOne(q, {
          $set: {
            email: newEmail,
            securityToken: null,
          },
        }, (erru) => {
          if (erru) {
            // If the email is taken, there will be a key conflict error.
            return next(erru);
          }

          // Refresh user token because its email has changed
          const token = generateAuthToken(username, newEmail, user.admin);

          // Email changed successfully
          loggers.log(req.user.name + ' changed email to ' + decoded.newEmail);

          return res.json({
            token: token,
            oldEmail: user.email,
            newEmail: newEmail,
          });
        });
      });
    });
  });
};
