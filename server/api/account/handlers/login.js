const status = require('http-status-codes');
const grable = require('georap-able');
const db = require('georap-db');
const bcrypt = require('bcryptjs');
const dal = require('../dal');
const authToken = require('../lib/authToken');
const loggers = require('../../../services/logs/loggers');

module.exports = function (req, res, next) {
  // Parameters:
  //   req.body
  //     Required keys:
  //       email: <string>
  //       password: <string>
  //

  const email = req.body.email; // treat also as username
  const password = req.body.password;

  // If injection attempted or no email or password provided.
  if (typeof email !== 'string' || typeof password !== 'string' ||
      email.length < 1 || password.length < 1) {
    return res.sendStatus(status.BAD_REQUEST);
  }

  const users = db.collection('users');

  // Allow login with email
  // Allow login with username, case-sensitive.
  // NOTE case-insensitive username match would require regexp query to DB.
  //   The regexp query requires case-insensitive search against
  //   the given username. The username is a string from anonymous user.
  //   That is dangerous. Login credentials can be long strings.
  //   They can be constructed to contain huge regexp programs.
  //   Therefore we cannot pass user input directly to regexp.
  //   Due to this difficulty, we must implement case-insensitivity
  //   in another manner.
  const q = {
    deleted: false,
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

    // Ensure that user has a role that can authenticate
    if (!grable.isAble(user, 'account-auth')) {
      const msg = 'Your account is frozen. ' +
        'This can happen after prolonged inactivity, bad behavior, ' +
        'or other security-related reasons. ' +
        'Contact site administration for further assistance.';
      return res.status(status.FORBIDDEN).send(msg);
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

      // Else, success. Passwords match. Build jwt token
      const token = authToken.generate(user.name, user.email, user.role);

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
