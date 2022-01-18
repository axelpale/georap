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
  // Invite a user by sending an email with a link that includes a token.
  // With that token the user is allowed to create a single account within
  // a time limit.
  //
  // Parameters:
  //   req.body
  //     Properties:
  //       email
  //         The email address where to send the invite.
  //       lang
  //         string, optional locale code e.g. 'en' that determines
  //         the translation of the invitation.
  //
  const email = req.body.email;
  let lang = req.body.lang;

  if (typeof email !== 'string') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  if (!validator.validate(email)) {
    return res.sendStatus(status.BAD_REQUEST);
  }

  // If no language or unknown language code is given,
  // use the default language.
  if (typeof lang !== 'string') {
    lang = config.defaultLocale;
  }
  if (!config.availableLocales.includes(lang)) {
    lang = config.defaultLocale;
  }
  // The selected language might differ from inviter account preferences.
  // Therefore we must change locale manually for correct mail translation.
  res.setLocale(lang);

  // Ensure that no account with this email exists already
  const users = db.collection('users');

  users.findOne({ email: email }, (err, user) => {

    if (err) {
      return next(err);
    }

    if (user) {
      // Account already exists :(
      return res.sendStatus(status.CONFLICT);
    }

    // Okay, everything good. Create email with a secure sign up link.

    const tokenPayload = {
      email: email,
      role: 'invited', // this role must be able to 'account-signup'
    };
    const token = jwt.sign(tokenPayload, config.secret, {
      expiresIn: '7d',
    });
    const url = rootUrl() + '/signup/' + token;

    // Make first letter lowercase, so that nice after comma.
    // ...welcome to My Site, my description.
    let desc = config.description;
    desc = desc.charAt(0).toLowerCase() + desc.slice(1);

    const mailOptions = {
      from: config.mail.sender,
      to: [email],
      subject: res.__('invite-mail-subject') + ' ' + config.title,
      text: templates.inviteMailTemplate({
        url: url,
        email: email,
        siteTitle: config.title,
        siteDesc: desc,
        __: res.__,
      }),
    };

    // Send the mail.
    mailer.get().sendMail(mailOptions, (err2) => {
      // Params:
      //   err2
      //   info
      //
      if (err2) {
        return next(err2);
      }  // else

      // Mail sent successfully
      loggers.log(req.user.name + ' sent invite to ' + email);

      return res.sendStatus(status.OK);
    });
  });
};
