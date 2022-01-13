const status = require('http-status-codes');
const config = require('georap-config');
const db = require('georap-db');
const jwt = require('jsonwebtoken');
const validator = require('email-validator');
const templates = require('../templates');
const securityCode = require('../lib/securityCode');
const mailer = require('../../../services/mailer');
const loggers = require('../../../services/logs/loggers');

module.exports = function (req, res, next) {
  // Parameters:
  //   req.body.email
  //

  const user = req.user; // from valid jwt token
  const newEmail = req.body.newEmail;

  if (!validator.validate(newEmail)) {
    // Only client should inform the user that especially the email is invalid.
    return res.sendStatus(status.BAD_REQUEST);
  }

  if (user.email === newEmail) {
    // Email is the same.
    return res.sendStatus(status.CONFLICT);
  }

  const users = db.collection('users');

  // Check that the new email is not in use.
  // We do this because email is used as a unique key.
  const cq = { email: newEmail };
  users.findOne(cq, (errc, conflictingUser) => {
    if (errc) {
      return next(errc);
    }

    if (conflictingUser) {
      return res.sendStatus(status.CONFLICT);
    }
    // Thus, no user with this email. We can continue.

    // Create a security code
    const code = securityCode.generate();
    // Wrap the code into a jwt token with short expiration time
    const tokenPayload = {
      name: user.name,
      securityCode: code,
      newEmail: newEmail,
    };
    const token = jwt.sign(tokenPayload, config.secret, {
      expiresIn: '30m',
    });

    // Store the security code with a expiration date to the user.
    const q = { name: user.name };
    const u = { $set: { securityToken: token } };
    users.findOneAndUpdate(q, u, (err, foundUser) => {
      if (err) {
        return next(err);
      }

      if (!foundUser) {
        // User not found with that name.
        return res.sendStatus(status.CONFLICT);
      }

      // Security code stored to be compared later.
      // Send the code in an email.
      const mailOptions = {
        from: config.mail.sender,
        to: [newEmail],
        subject: res.__('change-email-subject') + ' ' + config.title,
        text: templates.changeEmailMailTemplate({
          securityCode: code,
          newEmail: newEmail,
          siteTitle: config.title,
          __: res.__,
        }),
      };

      // Send the mail
      mailer.get().sendMail(mailOptions, (err2) => {
        // Params: err2, info
        //
        if (err2) {
          return next(err2);
        }  // else

        // Mail sent successfully
        loggers.log('Email change requested for ' +
          user.email + ' to ' + newEmail);

        return res.sendStatus(status.OK);
      });
    });
  });
};
