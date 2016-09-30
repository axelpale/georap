var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var validator = require("email-validator");
var local = require('../../config/local');

var fs = require('fs');
var path = require('path');
var ejs = require('ejs');

var resetMailTemplate = (function () {
  var p = path.resolve(__dirname, '../templates/resetEmail.ejs');
  var f = fs.readFileSync(p, 'utf8');
  return ejs.compile(f);
}());

var inviteMailTemplate = (function () {
  var p = path.resolve(__dirname, '../templates/inviteEmail.ejs');
  var f = fs.readFileSync(p, 'utf8');
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

    // Handle hashing error
    var err2;
    if (err) {
      err2 = new Error('hashing error');
      err2.name = 'hashingError';
      err2.origError = err;
      callback(err2);
      return;
    }

    // Construct the query.
    var findQuery = { email: email };
    var updateQuery = { $set: { hash: newHash } };

    // Collection
    var users = db.get('users');

    users.findOneAndUpdate(findQuery, updateQuery).then(function (user) {
      // If no user found.
      if (user === null) {
        err2 = new Error('User not found');
        err2.name = 'userNotFoundError';
        callback(err2);
        return;
      }  // else

      // Password changed successfully
      callback();
    }).catch(function (err) {
      // Update query failed. Connection to database was lost or something.
      err2 = new Error('Update query failed');
      err2.name = 'mongoQueryError';
      err2.origError = err;
      callback(err2);
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
    response({
      error: 'InvalidRequestError'
    });
    return;
  }

  var users = db.get('users');
  var query = { email: data.email };
  users.findOne(query).then(function (user) {

    if (user === null) {
      response({
        error: 'UnknownEmailError'
      });
      return;
    }

    bcrypt.compare(data.password, user.hash, function (err, match) {
      var tokenPayload;
      if (err) {
        // Hash comparison failed. Password might still be correct, though.
        response({
          error: 'HashingError'
        });
        return;
      }
      if (match) {
        // Success
        tokenPayload = {
          name: user.name,
          email: user.email,
          admin: user.admin
        };
        response({
          token: jwt.sign(tokenPayload, local.secret)
        });
      } else {
        // Authentication failure
        response({
          error: 'IncorrectPasswordError'
        });
      }
    });

  }).catch(function (err) {
    console.error(err);
    response({
      error: 'DatabaseError'
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

  // Verify user has logged in. We also get the email from the token.
  jwt.verify(data.token, local.secret, function (err, payload) {
    if (err) {
      // Problems with token
      response({
        error: 'invalid-token'
      });
      return;
    }  // else

    // User is logged in. Good. Find if user with this email still exists.
    var users = db.get('users');
    var query = { email: payload.email };
    users.findOne(query).then(function (user) {

      // If no user found.
      if (user === null) {
        response({
          error: 'change-password-invalid-email'
        });
        return;
      }  // else

      // Test if the given current password is correct
      bcrypt.compare(data.currentPassword, user.hash, function (err, match) {
        if (err) {
          response({
            error: 'HashingError'
          });
          return;
        }  // else

        if (!match) {
          response({
            error: 'IncorrectPasswordError'
          });
          return;
        }  // else

        // Success, current passwords match
        // Hash the new password before storing it to database.
        var r = local.bcrypt.rounds;
        bcrypt.hash(data.newPassword, r, function (err, newHash) {
          if (err) {
            response({
              error: 'HashingError'
            });
            return;
          }  // else

          // Ready to change password. Update hash in database.
          users.findOneAndUpdate(query, { $set: {
            hash: newHash
          }}).then(function (updatedUser) {
            // Check if user still exists
            if (updatedUser === null) {
              response({
                error: 'change-password-user-removed'
              })
              return;
            }  // else
            // Password changed successfully
            response({
              success: 'change-password-success'
            });
          }).catch(function (err) {
            // Update query failed. Connection to database was lost or something.
            console.error(err);
            response({
              error: 'change-password-update-query-failure'
            });
          });
        });
      });
    }).catch(function (err) {
      // User fetch for email and password check failed.
      // Connection to database was lost or something.
      console.error(err);
      response({
        error: 'change-password-find-query-failure'
      });
      return;
    });
  });
};


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
      response({
        error: 'reset-password-invalid-email'
      });
      return;
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
      passwordReset: true
    };
    var token = jwt.sign(tokenPayload, local.secret, {
      expiresIn: '30m'
    });
    var url = 'http://' + host + '/#reset=' + token;

    var mailOptions = {
      from: local.mail.sender,
      to: user.email,
      subject: 'Subterranea.fi password reset requested for your account',
      text: resetMailTemplate({ resetUrl: url, email: user.email })
    };

    // Send the mail.
    mailer.sendMail(mailOptions, function (err, info) {
      if (err) {
        response({
          error: 'reset-password-mail-server-failure'
        });
        return;
      }  // else
      console.log('Mail sent: ' + info.response);
      response({
        success: true
      });
      return;
    });
  }).catch(function (err) {
    // A query error.
    response({
      error: 'reset-password-find-query-failure'
    });
    return;
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
    response({
      error: 'InvalidPasswordError'
    });
    return;
  }

  jwt.verify(data.token, local.secret, function (err, payload) {
    if (err || typeof payload.email !== 'string') {
      // E.g. expired token
      response({
        error: 'InvalidTokenError'
      });
      return;
    }  // else

    var email = payload.email;
    var newPassword = data.password;
    setPassword(db, payload.email, data.password, function (err) {
      if (err) {
        response({
          error: err.name
        });
        return;
      }  // else
      response({
        success: true
      });
    });
  });
};


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
        error: 'InvalidTokenError'
      });
      return;
    }  // else

    if (payload.admin !== true) {
      response({
        error: 'PrivilegeError'
      });
      return;
    }  // else

    if (!data.hasOwnProperty('email') || typeof data.email !== 'string') {
      response({
        error: 'InvalidRequestError'
      });
      return;
    }  // else

    if (!validator.validate(data.email)) {
      response({
        error: 'InvalidEmailError'
      });
      return;
    }  // else

    // Check if an account with this email already exists
    db.get('users').findOne({ email: data.email }).then(function (user) {

      if (user) {
        // Already exists
        response({
          error: 'AccountExistsError'
        });
        return;
      }  // else

      // Okay, everything good. Create email with a secure sign up link.

      var tokenPayload = {
        email: data.email,
        invite: true
      };
      var token = jwt.sign(tokenPayload, local.secret, {
        expiresIn: '7d'
      });
      var url = 'http://' + host + '/#invite=' + token;

      var mailOptions = {
        from: local.mail.sender,
        to: data.email,
        subject: 'Invite to Subterranea.fi',
        text: inviteMailTemplate({ url: url, email: data.email })
      };

      // Send the mail.
      mailer.sendMail(mailOptions, function (err, info) {
        if (err) {
          response({
            error: 'MailServerError'
          });
          return;
        }  // else

        // Mail sent successfully
        console.log('Mail sent: ' + info.response);
        response({
          success: true
        });
      });  // mailer

    }).catch(function (err) {
      // Mongo problem.
      console.error(err);
      response({
        error: 'DatabaseError'
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
      response({
        error: 'InvalidTokenError'
      });
      return;
    }  // else

    if (!payload.hasOwnProperty('email')) {
      response({
        error: 'InvalidTokenError'
      });
      return;
    }  // else

    if (!validator.validate(payload.email)) {
      response({
        error: 'InvalidTokenError'
      });
      return;
    }  // else

    if (!data.hasOwnProperty('username') || !data.hasOwnProperty('password')) {
      response({
        error: 'InvalidRequestError'
      });
      return;
    }  // else

    // Ensure username and password are strings.
    // This prevents Mongo injection.
    var usernameType = typeof data.username;  // to shorten linelength
    var passwordType = typeof data.password;
    if (usernameType !== 'string' || passwordType !== 'string') {
      response({
        error: 'InvalidRequestError'
      });
      return;
    }  // else

    // Ensure username does not yet exist.
    // We could check this from an insert error but this way we can separate
    // username index violation and email index violation.
    // We also avoid computing password hash.

    var users = db.get('users');
    users.findOne({
      $or: [ { name: data.username }, { email: payload.email } ]
    }).then(function (user) {
      if (user !== null) {
        // Duplicate username or email.
        if (user.name === data.username) {
          response({
            error: 'UsernameTakenError'
          });
          return;
        }  // else
        if (user.email === payload.email) {
          response({
            error: 'EmailTakenError'
          });
          return;
        }  // else
        throw new Error('Should not get here');
      }  // else

      // No matching user found. We are clear to add one.
      // Note: there is a tiny risk that such user is created after
      // the check but before insert.

      bcrypt.hash(data.password, local.bcrypt.rounds, function (err, pwdHash) {
        if (err) {
          response({
            error: 'HashingError'
          });
          return;
        }  // else

        users.insert({
          name: data.username,
          email: payload.email,
          hash: pwdHash,
          admin: false
        }).then(function (user) {
          // User inserted successfully
          response({
            success: true
          });
        }).catch(function (err) {
          // Some mongo error.
          console.error(err);
          response({
            error: err.name
          });
        });  // users.insert catch
      });

    }).catch(function (err) {
      // Some mongo error.
      console.error(err);
      response({
        error: err.name
      });
    });  // findOne catch
  });  // jwt
};
