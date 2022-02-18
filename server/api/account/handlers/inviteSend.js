const status = require('http-status-codes');
const config = require('georap-config');
const db = require('georap-db');
const jwt = require('jsonwebtoken');
const validator = require('email-validator');
const templates = require('../templates');
const rootUrl = require('../rootUrl');
const mailer = require('../../../services/mailer');
const loggers = require('../../../services/logs/loggers');
const isAble = require('georap-able').isAble;

const canAssignRole = function (authorRole, targetRole) {
  // Returns true if author role is allowed to assign the target role.
  const targetRoleIndex = config.roles.indexOf(targetRole);
  const authorRoleIndex = config.roles.indexOf(authorRole);
  return targetRoleIndex <= authorRoleIndex;
};

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
  //       role
  //         string
  //
  const email = req.body.email;
  if (typeof email !== 'string') {
    return res.status(status.BAD_REQUEST).send('Bad email address');
  }
  if (!validator.validate(email)) {
    return res.status(status.BAD_REQUEST).send('Bad email address');
  }

  // Validate role
  const invitedRole = req.body.role;
  if (!config.roles.includes(invitedRole)) {
    return res.status(status.BAD_REQUEST).send('Bad role string');
  }
  // Prevent giving non-default role without capability
  const defaultRole = config.defaultRole;
  const canRole = isAble(req.user, 'admin-users-invite-role');
  if (invitedRole !== defaultRole && !canRole) {
    const msg = 'You cannot assign non-default roles for new users.';
    return res.status(status.FORBIDDEN).send(msg);
  }
  // Prevent creating roles higher than own role.
  // Otherwise a moderator could create an admin account for herself.
  if (!canAssignRole(req.user.role, invitedRole)) {
    const msg = 'You cannot invite for role higher than your own.';
    return res.status(status.FORBIDDEN).send(msg);
  }

  // Invitation language
  let lang = req.body.lang;
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
      type: 'invited-signup',
      email: email,
      invitedRole: invitedRole,
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
