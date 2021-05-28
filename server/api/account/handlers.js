/* eslint max-lines: 'off' */

const status = require('http-status-codes');
const config = require('georap-config');
const db = require('georap-db');

const hostname = require('../../services/hostname');
const mailer = require('../../services/mailer');
const loggers = require('../../services/logs/loggers');

const dal = require('./dal');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('email-validator');

// Precompiled email templates
const templates = require('./templates');


exports.login = function (req, res, next) {
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

exports.changePassword = function (req, res, next) {
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

exports.sendResetPasswordEmail = function (req, res, next) {
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
      name: user.name,
      email: user.email,
      admin: user.admin,
      passwordReset: true,
    };
    const token = jwt.sign(tokenPayload, config.secret, {
      expiresIn: '30m',
    });
    const host = hostname.get();
    const url = config.publicProtocol + '://' + host + '/reset/' + token;

    const mailOptions = {
      from: config.mail.sender,
      to: user.email,
      subject: config.title + ' password reset requested for your account',
      text: templates.resetMailTemplate({
        resetUrl: url,
        email: user.email,
        siteTitle: config.title,
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


exports.resetPassword = function (req, res, next) {
  // Parameters:
  //   req.body
  //     Properties:
  //       password

  const password = req.body.password;
  const email = req.user.email;

  if (typeof password !== 'string' || typeof email !== 'string') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  // Hash the new password before storing it to database.
  bcrypt.hash(password, config.bcrypt.rounds, (err, newHash) => {

    if (err) {
      return next(err);
    }

    // Construct the query.
    const q = { email: email };
    const u = { $set: { hash: newHash } };

    // Collection
    const users = db.get().collection('users');

    users.findOneAndUpdate(q, u, (err2, user) => {

      if (err2) {
        return next(err2);
      }

      // If no user found.
      if (user === null) {
        return res.sendStatus(status.UNAUTHORIZED);
      }

      // Password changed successfully
      loggers.log(req.user.name + ' reset password.');

      return res.sendStatus(status.OK);
    });
  });
};

exports.sendInviteEmail = function (req, res, next) {
  // Invite a user by sending an email with a link that includes a token.
  // With that token the user is allowed to create a single account within
  // a time limit.
  //
  // Parameters:
  //   req.body
  //     Properties:
  //       email
  //         The email address where to send the invite.

  const email = req.body.email;
  const isAdmin = req.user.admin;

  if (isAdmin !== true) {
    return res.sendStatus(status.UNAUTHORIZED);
  }

  if (typeof email !== 'string') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  if (!validator.validate(email)) {
    return res.sendStatus(status.BAD_REQUEST);
  }

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
      invite: true,
    };
    const token = jwt.sign(tokenPayload, config.secret, {
      expiresIn: '7d',
    });
    const host = hostname.get();
    const url = config.publicProtocol + '://' + host + '/signup/' + token;

    // Make first letter lowercase, so that nice after comma.
    // ...welcome to My Site, my description.
    let desc = config.description;
    desc = desc.charAt(0).toLowerCase() + desc.slice(1);

    const mailOptions = {
      from: config.mail.sender,
      to: email,
      subject: 'Invite to ' + config.title,
      text: templates.inviteMailTemplate({
        url: url,
        email: email,
        siteTitle: config.title,
        siteDesc: desc,
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

exports.signup = function (req, res, next) {
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

  const users = db.collection('users');

  users.findOne({
    $or: [ { name: username }, { email: email } ],
  }, (err, user) => {

    if (err) {
      return next(err);
    }

    if (user) {
      return res.sendStatus(status.CONFLICT);
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
