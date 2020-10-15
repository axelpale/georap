/* eslint max-lines: 'off' */

var status = require('http-status-codes');
var config = require('tresdb-config');
var db = require('tresdb-db');

var hostname = require('../../services/hostname');
var mailer = require('../../services/mailer');
var loggers = require('../../services/logs/loggers');

var dal = require('./dal');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var validator = require('email-validator');

// Precompiled email templates
var templates = require('./templates');


exports.login = function (req, res, next) {
  // Parameters:
  //   req.body
  //     Required keys:
  //       email: <string>
  //       password: <string>
  //

  var email = req.body.email;
  var password = req.body.password;

  // If injection attempted or no email or password provided.
  if (typeof email !== 'string' || typeof password !== 'string' ||
      email.length < 1 || password.length < 1) {
    return res.sendStatus(status.BAD_REQUEST);
  }

  var users = db.collection('users');

  // Also allow login with username.
  var q = {
    $or: [
      { name: email },
      { email: email },
    ],
  };

  users.findOne(q, function (err, user) {

    if (err) {
      return next(err);
    }

    if (user === null) {
      return res.sendStatus(status.UNAUTHORIZED);
    }

    bcrypt.compare(password, user.hash, function (err2, match) {
      var tokenPayload, tokenOptions, token;

      if (err2) {
        // Hash comparison failed. Password might still be correct, though.
        return next(err2);
      }

      if (!match) {
        // no password match => Authentication failure
        return res.sendStatus(status.UNAUTHORIZED);
      }

      // Else, success. Passwords match.

      // Check if user is deactivated
      if (user.status !== 'active') {
        res.status(status.FORBIDDEN);
        res.send('Your account has been deactivated.');

        return;
      }

      // else, build jwt token

      tokenPayload = {
        name: user.name,
        email: user.email,
        admin: user.admin,
      };

      // The following will add 'exp' property to payload.
      // For time formatting, see https://github.com/zeit/ms
      tokenOptions = {
        expiresIn: '60d',  // two months,
      };

      token = jwt.sign(tokenPayload, config.secret, tokenOptions);

      // Successful login.
      loggers.log(user.name + ' logged in.');

      return res.json(token);
    });
  });
};

exports.changePassword = function (req, res, next) {
  // Parameters:
  //   req.body
  //     Required keys:
  //       currentPassword
  //       newPassword

  var currentPassword = req.body.currentPassword;
  var newPassword = req.body.newPassword;
  var email = req.user.email;

  // Validate data
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  // User is logged in. Good. Find if user with this email still exists.
  var users = db.collection('users');

  users.findOne({ email: email }, function (err, user) {

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
    bcrypt.compare(currentPassword, user.hash, function (err2, match) {

      if (err2) {
        return next(err2);
      }  // else

      if (!match) {
        return res.sendStatus(status.UNAUTHORIZED);
      }  // else

      // Success, current passwords match
      // Hash the new password before storing it to database.
      var r = config.bcrypt.rounds;

      bcrypt.hash(newPassword, r, function (err3, newHash) {

        if (err3) {
          return next(err3);
        }  // else

        var q = { email: email };
        var u = { $set: { hash: newHash } };

        // Ready to change password. Update hash in database.
        users.findOneAndUpdate(q, u, function (err4, updatedUser) {

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

  var email = req.body.email;

  if (!validator.validate(email)) {
    // Only client should inform the user that especially the email is invalid.
    return res.sendStatus(status.BAD_REQUEST);
  }

  // Fetch user from database to ensure the email exists.
  // First get collection.
  var users = db.collection('users');

  users.findOne({ email: email }, function (err, user) {

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

    var tokenPayload = {
      name: user.name,
      email: user.email,
      admin: user.admin,
      passwordReset: true,
    };
    var token = jwt.sign(tokenPayload, config.secret, {
      expiresIn: '30m',
    });
    var host = hostname.get();
    var url = config.publicProtocol + '://' + host + '/reset/' + token;

    var mailOptions = {
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
    mailer.get().sendMail(mailOptions, function (err2) {
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

  var password = req.body.password;
  var email = req.user.email;

  if (typeof password !== 'string' || typeof email !== 'string') {
    return res.sendStatus(status.BAD_REQUEST);
  }

  // Hash the new password before storing it to database.
  bcrypt.hash(password, config.bcrypt.rounds, function (err, newHash) {

    if (err) {
      return next(err);
    }

    // Construct the query.
    var q = { email: email };
    var u = { $set: { hash: newHash } };

    // Collection
    var users = db.get().collection('users');

    users.findOneAndUpdate(q, u, function (err2, user) {

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

  var email = req.body.email;
  var isAdmin = req.user.admin;

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
  var users = db.collection('users');

  users.findOne({ email: email }, function (err, user) {

    if (err) {
      return next(err);
    }

    if (user) {
      // Account already exists :(
      return res.sendStatus(status.CONFLICT);
    }

    // Okay, everything good. Create email with a secure sign up link.

    var tokenPayload = {
      email: email,
      invite: true,
    };
    var token = jwt.sign(tokenPayload, config.secret, {
      expiresIn: '7d',
    });
    var host = hostname.get();
    var url = config.publicProtocol + '://' + host + '/signup/' + token;

    // Make first letter lowercase, so that nice after comma.
    // ...welcome to My Site, my description.
    var desc = config.description;
    desc = desc.charAt(0).toLowerCase() + desc.slice(1);

    var mailOptions = {
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
    mailer.get().sendMail(mailOptions, function (err2) {
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

  var email = req.user.email;
  var username = req.body.username;
  var password = req.body.password;

  // Ensure username and password are strings.
  // This prevents Mongo injection.
  var validRequest = (
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

  var users = db.collection('users');

  users.findOne({
    $or: [ { name: username }, { email: email } ],
  }, function (err, user) {

    if (err) {
      return next(err);
    }

    if (user) {
      return res.sendStatus(status.CONFLICT);
    }

    // No matching user found. We are clear to add one.
    // Note: there is a tiny risk that such user is created after
    // the check but before insert.

    dal.createUser(username, email, password, function (err2) {
      if (err2) {
        return next(err2);
      }

      // User inserted successfully
      loggers.log(username + ' signed up (' + email + ').');

      return res.sendStatus(status.OK);
    });
  });
};
