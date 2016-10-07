/* eslint max-lines: 'off' */

var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var validator = require('email-validator');
var local = require('../../config/local');

var fs = require('fs');
var path = require('path');
var ejs = require('ejs');

var resetMailTemplate = (function () {
  var p = path.resolve(__dirname, '../templates/resetEmail.ejs');
  var f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync

  return ejs.compile(f);
}());

var inviteMailTemplate = (function () {
  var p = path.resolve(__dirname, '../templates/inviteEmail.ejs');
  var f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync

  return ejs.compile(f);
}());


// Private methods

var setPassword = function (db, email, password, callback) {
  // Just change the password for the account.
  //
  // Parameters:
  //   db
  //     Monk db instance
  //   email
  //     string, Account email
  //   password
  //     string, The new password
  //   callback
  //     function (err)
  //
  // Error names:
  //   hashingError
  //   userNotFoundError
  //   mongoQueryError

  // Ensure types to avoid Mongo injection.
  if (typeof email !== 'string') {
    throw new Error('dangerous non-string email address');
  }
  if (typeof password !== 'string') {
    throw new Error('dangerous non-string password');
  }

  // Hash the new password before storing it to database.
  bcrypt.hash(password, local.bcrypt.rounds, function (err, newHash) {
    var err2;

    // Handle hashing error
    if (err) {
      err2 = new Error('hashing error');
      err2.name = 'hashingError';
      err2.origError = err;

      return callback(err2);
    }

    // Construct the query.
    var findQuery = { email: email };
    var updateQuery = { $set: { hash: newHash } };

    // Collection
    var users = db.get('users');

    users.findOneAndUpdate(findQuery, updateQuery).then(function (user) {
      var err3;

      // If no user found.
      if (user === null) {
        err3 = new Error('User not found');
        err3.name = 'userNotFoundError';

        return callback(err3);
      }  // else

      // Password changed successfully
      return callback();
    }).catch(function (err4) {
      var err5;

      // Update query failed. Connection to database was lost or something.
      err5 = new Error('Update query failed');
      err5.name = 'mongoQueryError';
      err5.origError = err4;

      return callback(err5);
    });
  });
};


// Public methods


exports.login = function (db, data, response) {
  // Parameters:
  //   db
  //     Monk db instance
  //   data
  //     Socket.io event payload.
  //     Required keys:
  //       email: <string>
  //       password: <string>
  //   response
  //     Socket.io response.
  //
  // Possible responses:
  //   { token: <string> }, on successful login
  //   { error: 'InvalidRequestError' }, on invalid socket.io payload
  //   { error: 'login-invalid-email' },
  //   { error: 'HashingError' }
  //   { error: 'login-invalid-password' }
  //   { error: 'DatabaseError' }

  // If no email or password provided or injection attempted.
  // Also, ensure nice email.
  if (!data.hasOwnProperty('email') || !data.hasOwnProperty('password') ||
      typeof data.email !== 'string' || typeof data.password !== 'string' ||
      !validator.validate(data.email) || data.password.length < 1) {
    return response({
      error: 'InvalidRequestError',
    });
  }

  var users = db.get('users');
  var query = { email: data.email };

  users.findOne(query).then(function (user) {

    if (user === null) {
      return response({
        error: 'UnknownEmailError',
      });
    }

    bcrypt.compare(data.password, user.hash, function (err, match) {
      var tokenPayload;

      if (err) {
        // Hash comparison failed. Password might still be correct, though.
        return response({
          error: 'HashingError',
        });
      }

      if (match) {
        // Success
        tokenPayload = {
          name: user.name,
          email: user.email,
          admin: user.admin,
        };

        return response({
          token: jwt.sign(tokenPayload, local.secret),
        });
      }  // else

      // Authentication failure
      return response({
        error: 'IncorrectPasswordError',
      });
    });

  }).catch(function (err) {
    console.error(err);
    response({
      error: 'DatabaseError',
    });
  });
};

exports.changePassword = function (db, data, response) {
  // Parameters:
  //   db
  //     Monk db instance
  //   data
  //     Socket.io event payload. Required keys:
  //       token
  //       currentPassword
  //       newPassword
  //   response
  //     Socket.io response.

  // Validate data
  if (!data.hasOwnProperty('token') ||
      !data.hasOwnProperty('currentPassword') ||
      !data.hasOwnProperty('newPassword') ||
      typeof data.token !== 'string' ||
      typeof data.currentPassword !== 'string' ||
      typeof data.newPassword !== 'string') {
    return response({ error: 'InvalidRequestError' });
  }

  // Verify user has logged in. We also get the email from the token.
  jwt.verify(data.token, local.secret, function (err, payload) {
    if (err) {
      // Problems with token
      return response({ error: 'InvalidRequestError' });
    }  // else

    // User is logged in. Good. Find if user with this email still exists.
    var users = db.get('users');
    var query = { email: payload.email };

    users.findOne(query).then(function (user) {

      // If no user found.
      if (user === null) {
        return response({ error: 'UnknownEmailError' });
      }  // else

      // Test if the given current password is correct
      bcrypt.compare(data.currentPassword, user.hash, function (err2, match) {
        if (err2) {
          return response({ error: 'HashingError' });
        }  // else

        if (!match) {
          return response({ error: 'IncorrectPasswordError' });
        }  // else

        // Success, current passwords match
        // Hash the new password before storing it to database.
        var r = local.bcrypt.rounds;

        bcrypt.hash(data.newPassword, r, function (err3, newHash) {
          if (err3) {
            return response({ error: 'HashingError' });
          }  // else

          // Ready to change password. Update hash in database.
          users.findOneAndUpdate(query, { $set: {
            hash: newHash,
          } }).then(function (updatedUser) {
            // Check if user still exists
            if (updatedUser === null) {
              return response({ error: 'UnknownEmailError' });
            }  // else
            // Password changed successfully

            return response({ success: true });
          }).catch(function (err4) {
            // Update query failed. Maybe connection to database was lost.
            console.error(err4);

            return response({ error: 'DatabaseError' });
          });
        });
      });
    }).catch(function (err5) {
      // User fetch for email and password check failed.
      // Connection to database was lost or something.
      console.error(err5);

      return response({ error: 'DatabaseError' });
    });
  });
};

// eslint-disable-next-line max-params
exports.sendResetPasswordEmail = function (db, mailer, host, data, response) {
  // Parameters:
  //   db
  //     Monk db instance
  //   mailer
  //     Nodemailer transporter instance
  //   host
  //     Server hostname e.g. 'mydomain.com' or 'localhost:3000'
  //   data
  //     Socket.io event payload
  //   response
  //     Socket.io response.

  // Fetch user from database to ensure the email exists.
  // First get collection.
  var users = db.get('users');

  users.findOne({ email: data.email }).then(function (user) {

    if (user === null) {
      // User not found with that email address.
      return response({
        error: 'reset-password-invalid-email',
      });
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
    var token = jwt.sign(tokenPayload, local.secret, {
      expiresIn: '30m',
    });
    var url = 'http://' + host + '/reset/' + token;

    var mailOptions = {
      from: local.mail.sender,
      to: user.email,
      subject: 'Subterranea.fi password reset requested for your account',
      text: resetMailTemplate({
        resetUrl: url,
        email: user.email,
      }),
    };

    // Send the mail.
    mailer.sendMail(mailOptions, function (err, info) {
      if (err) {
        return response({
          error: 'reset-password-mail-server-failure',
        });
      }  // else
      console.log('Mail sent: ' + info.response);

      return response({
        success: true,
      });
    });
  }).catch(function () {
    // A query error.
    return response({
      error: 'reset-password-find-query-failure',
    });
  });
};


exports.resetPassword = function (db, data, response) {
  // Parameters:
  //   db
  //     Monk db instance
  //   data
  //     plain object, Socket.io event payload:
  //       token
  //       password
  //   response
  //     Socket.io response.
  //
  // Errors (response.error):
  //   InvalidPasswordError
  //   InvalidTokenError

  if (typeof data.password !== 'string') {
    return response({
      error: 'InvalidPasswordError',
    });
  }

  jwt.verify(data.token, local.secret, function (err, payload) {
    if (err || typeof payload.email !== 'string') {
      // E.g. expired token
      return response({
        error: 'InvalidTokenError',
      });
    }  // else

    setPassword(db, payload.email, data.password, function (err2) {
      if (err2) {
        return response({
          error: err2.name,
        });
      }  // else

      return response({
        success: true,
      });
    });
  });
};

// eslint-disable-next-line max-params
exports.sendInviteEmail = function (db, mailer, host, data, response) {
  // Invite a user by sending an email with a link that includes a token.
  // With that token the user is allowed to create a single account within
  // a time limit.
  //
  // Parameters:
  //   db
  //     Monk db instance
  //   mailer
  //     Nodemailer transporter instance
  //   host
  //     Hostname e.g. 'localhost:3000' or 'mydomain.com'
  //   data
  //     plain object, Socket.io event payload:
  //       token
  //         Inviter's token.
  //         Used to check does inviter have privileges to invite.
  //       email
  //         The email address where to send the invite.
  //   response
  //     Socket.io response.

  jwt.verify(data.token, local.secret, function (err, payload) {
    if (err) {
      response({
        error: 'InvalidTokenError',
      });

      return;
    }  // else

    if (payload.admin !== true) {
      response({
        error: 'PrivilegeError',
      });

      return;
    }  // else

    if (!data.hasOwnProperty('email') || typeof data.email !== 'string') {
      response({
        error: 'InvalidRequestError',
      });

      return;
    }  // else

    if (!validator.validate(data.email)) {
      response({
        error: 'InvalidEmailError',
      });

      return;
    }  // else

    // Check if an account with this email already exists
    var users = db.get('users');

    users.findOne({ email: data.email }).then(function (user) {

      if (user) {
        // Already exists
        response({
          error: 'AccountExistsError',
        });

        return;
      }  // else

      // Okay, everything good. Create email with a secure sign up link.

      var tokenPayload = {
        email: data.email,
        invite: true,
      };
      var token = jwt.sign(tokenPayload, local.secret, {
        expiresIn: '7d',
      });
      var url = 'http://' + host + '/signup/' + token;

      var mailOptions = {
        from: local.mail.sender,
        to: data.email,
        subject: 'Invite to Subterranea.fi',
        text: inviteMailTemplate({
          url: url,
          email: data.email,
        }),
      };

      // Send the mail.
      mailer.sendMail(mailOptions, function (err2, info) {
        if (err2) {
          return response({
            error: 'MailServerError',
          });
        }  // else

        // Mail sent successfully
        console.log('Mail sent: ' + info.response);

        return response({
          success: true,
        });
      });  // mailer

    }).catch(function (err3) {
      // Mongo problem.
      console.error(err3);

      return response({
        error: 'DatabaseError',
      });
    });

  });  // jwt
};

exports.signup = function (db, data, response) {
  // After invite, a user signs up. The client must send the token that was
  // associated with the invite email.
  //
  // Parameters:
  //   db
  //     Monk db instance
  //   data
  //     plain object, Socket.io event payload:
  //       token
  //         Token in the invite. Contains user email and expiration.
  //       username
  //         New username
  //       password
  //         New password
  //   response
  //     Socket.io response.

  jwt.verify(data.token, local.secret, function (err, payload) {
    if (err) {
      return response({
        error: 'InvalidTokenError',
      });
    }  // else

    if (!payload.hasOwnProperty('email')) {
      return response({
        error: 'InvalidTokenError',
      });
    }  // else

    if (!validator.validate(payload.email)) {
      return response({
        error: 'InvalidTokenError',
      });
    }  // else

    if (!data.hasOwnProperty('username') || !data.hasOwnProperty('password')) {
      return response({
        error: 'InvalidRequestError',
      });
    }  // else

    // Ensure username and password are strings.
    // This prevents Mongo injection.
    var usernameType = typeof data.username;  // to shorten linelength
    var passwordType = typeof data.password;

    if (usernameType !== 'string' || passwordType !== 'string') {
      return response({
        error: 'InvalidRequestError',
      });
    }  // else

    // Ensure username does not yet exist.
    // We could check this from an insert error but this way we can separate
    // username index violation and email index violation.
    // We also avoid computing password hash.

    var users = db.get('users');

    users.findOne({
      $or: [ { name: data.username }, { email: payload.email } ],
    }).then(function (user) {
      if (user !== null) {

        // Duplicate username or email.
        if (user.name === data.username) {
          return response({
            error: 'UsernameTakenError',
          });
        }  // else

        if (user.email === payload.email) {
          return response({
            error: 'EmailTakenError',
          });
        }  // else

        throw new Error('Should not get here');
      }  // else

      // No matching user found. We are clear to add one.
      // Note: there is a tiny risk that such user is created after
      // the check but before insert.

      var r = local.bcrypt.rounds;

      bcrypt.hash(data.password, r, function (err2, pwdHash) {
        if (err2) {
          return response({
            error: 'HashingError',
          });
        }  // else

        users.insert({
          name: data.username,
          email: payload.email,
          hash: pwdHash,
          admin: false,
        }).then(function () {
          // User inserted successfully
          return response({
            success: true,
          });
        }).catch(function (err3) {
          // Some mongo error.
          console.error(err3);

          return response({
            error: err3.name,
          });
        });  // users.insert catch
      });

    }).catch(function (err4) {
      // Some mongo error.
      console.error(err4);

      return response({
        error: err4.name,
      });
    });  // findOne catch
  });  // jwt
};
