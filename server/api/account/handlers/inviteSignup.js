const status = require('http-status-codes');
const db = require('georap-db');
const validator = require('email-validator');
const dal = require('../dal');
const loggers = require('../../../services/logs/loggers');

module.exports = function (req, res, next) {
  // After invite, a user signs up. The client must send the token that was
  // associated with the invite email.
  //
  // Parameters:
  //   req.body
  //     Properties:
  //       username
  //         New username
  //       password
  //         New password
  //   req.user
  //     Properties:
  //       email

  const email = req.user.email;
  const username = req.body.username;
  const password = req.body.password;

  // Ensure username and password are strings.
  // This prevents Mongo injection.
  const validRequest = (
    typeof username === 'string' &&
    typeof password === 'string' &&
    validator.validate(email)
  );

  if (!validRequest) {
    return res.sendStatus(status.BAD_REQUEST);
  }

  // Ensure username does not yet exist.
  // We could check this from an insert error but this way we can separate
  // username index violation and email index violation.
  // We also avoid computing password hash.
  db.collection('users').findOne({
    $or: [ { name: username }, { email: email } ],
  }, (err, user) => {

    if (err) {
      return next(err);
    }

    if (user) {
      return res.status(status.CONFLICT).send('Account already exists');
    }

    // No matching user found. We are clear to add one.
    // Note: there is a tiny risk that such user is created after
    // the check but before insert.

    dal.createUser(username, email, password, (err2) => {
      if (err2) {
        return next(err2);
      }

      // User inserted successfully
      loggers.log(username + ' signed up (' + email + ').');

      return res.sendStatus(status.OK);
    });
  });
};
