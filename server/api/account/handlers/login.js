const status = require('http-status-codes');
const db = require('georap-db');
const bcrypt = require('bcryptjs');
const dal = require('../dal');
const generateAuthToken = require('../lib/generateAuthToken');
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

      // Provide a bit of backward compatibility in v13-v14 transition
      // Remove in v15.
      if (!user.role && typeof user.admin === 'boolean') {
        // Pre-v14 db schema
        user.role = user.admin ? 'admin' : 'basic';
      }

      // else, build jwt token
      const token = generateAuthToken(user.name, user.email, user.role);

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
