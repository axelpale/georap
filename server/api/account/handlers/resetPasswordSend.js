const status = require('http-status-codes');
const config = require('georap-config');
const db = require('georap-db');
const jwt = require('jsonwebtoken');
const validator = require('email-validator');
const templates = require('../templates');
const rootUrl = require('../rootUrl');
const mailer = require('../../../services/mailer');
const loggers = require('../../../services/logs/loggers');

module.exports = function (req, res, next) {
  // Parameters:
  //   req.body
  //     Properties:
  //       email
  //         string

  const email = req.body.email;

  if (!validator.validate(email)) {
    // Only client should inform the user that especially the email is invalid.
    return res.sendStatus(status.BAD_REQUEST);
  }

  // Fetch user from database to ensure the email exists.
  // First get collection.
  const users = db.collection('users');

  users.findOne({ email: email }, (err, user) => {

    if (err) {
      return next(err);
    }

    if (!user) {
      // User not found with that email address.
      return res.sendStatus(status.CONFLICT);
    }

    // Okay, user exists. We do not clear user password now, because
    // otherwise anyone could clear anyother's passwords, forcing them
    // to set their passwords again and again.

    // We will send an email. The email contains a link that allows user
    // to reset his or her password during the next 30 minutes.

    const tokenPayload = {
      // NOTE no 'name' prop because auth will pass tokens without name
      type: 'password-reset',
      email: user.email,
    };
    const token = jwt.sign(tokenPayload, config.secret, {
      expiresIn: '30m',
    });
    const url = rootUrl() + '/reset/' + token;

    const mailOptions = {
      from: config.mail.sender,
      to: [user.email],
      subject: res.__('pwd-reset-subject') + ' ' + config.title,
      text: templates.resetMailTemplate({
        resetUrl: url,
        email: user.email,
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
      loggers.log('Password reset mail sent to ' + user.email);

      return res.sendStatus(status.OK);
    });
  });
};
