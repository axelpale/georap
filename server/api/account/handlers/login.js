const status = require('http-status-codes');
const config = require('georap-config');
const db = require('georap-db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dal = require('../dal');
const loggers = require('../../../services/logs/loggers');

module.exports = function (req, res, next) {
  // Parameters:
  //   req.body
  //     Required keys:
  //       email: <string>
  //       password: <string>
  //

  const email = req.body.email;
  const password = req.body.password;

  // If injection attempted or no email or password provided.
  if (typeof email !== 'string' || typeof password !== 'string' ||
      email.length < 1 || password.length < 1) {
    return res.sendStatus(status.BAD_REQUEST);
  }

  const users = db.collection('users');

  // Also allow login with username.
  const q = {
    $or: [
      { name: email },
      { email: email },
    ],
  };

  users.findOne(q, (err, user) => {

    if (err) {
      return next(err);
    }

    if (user === null) {
      const msg = 'Invalid username or password';
      return res.status(status.UNAUTHORIZED).send(msg);
    }

    bcrypt.compare(password, user.hash, (err2, match) => {
      if (err2) {
        // Hash comparison failed. Password might still be correct, though.
        return next(err2);
      }

      if (!match) {
        // no password match => Authentication failure
        const msg = 'Invalid username or password';
        return res.status(status.UNAUTHORIZED).send(msg);
      }

      // Else, success. Passwords match.

      // Check if user is deactivated
      if (user.status !== 'active') {
        const msg = 'Your account is deactivated. ' +
          'This can happen for prolonged inactivity or other security-' +
          'related reasons. Contact site administration for futher ' +
          'assistance.';
        return res.status(status.FORBIDDEN).send(msg);
      }

      // else, build jwt token

      const tokenPayload = {
        name: user.name,
        email: user.email,
        admin: user.admin,
      };

      // The following will add 'exp' property to payload.
      // For time formatting, see https://github.com/zeit/ms
      const tokenOptions = {
        expiresIn: '60d',  // two months,
      };

      const token = jwt.sign(tokenPayload, config.secret, tokenOptions);

      // Register login time.
      dal.markLogin(user.name, (errl) => {
        if (errl) {
          return next(errl);
        }

        // Successful login.
        loggers.log(user.name + ' logged in.');

        return res.json(token);
      });
    });
  });
};
