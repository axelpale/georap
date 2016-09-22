var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var local = require('../../config/local');

var fs = require('fs');
var path = require('path');
var ejs = require('ejs');

var resetMailTemplate = (function () {
  var p = path.resolve(__dirname, '../templates/reset.ejs');
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
  bcrypt.hash(password, 10, function (err, newHash) {

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
  //     Socket.io event payload
  //   response
  //     Socket.io response.

  // TODO
  // if no email or password provided...

  console.log('auth/login: about to find ' + data.email);

  var users = db.get('users');
  var query = { email: data.email };
  users.findOne(query).then(function (user) {
    var match, tokenPayload;

    if (user === null) {
      console.log('auth/login: user null, not found');
      response({
        error: 'login-invalid-email'
      });
      return;
    }

    match = bcrypt.compareSync(data.password, user.hash);

    if (match) {
      // Success
      console.log('auth/login: password hash match');
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
      console.log('auth/login: password hash dismatch');
      response({
        error: 'login-invalid-password'
      });
    }
  }).catch(function (err) {
    console.error('loginRequest: findOne: something went wrong.');
  });
};

exports.changePassword = function (db, data, response) {
  // Parameters:
  //   db
  //     Monk db instance
  //   data
  //     Socket.io event payload
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
      var match, newHash;

      // If no user found.
      if (user === null) {
        console.error('auth/changePassword: user null, not found');
        response({
          error: 'change-password-invalid-email'
        });
        return;
      }

      // Test if the given current password is correct
      match = bcrypt.compareSync(data.currentPassword, user.hash);
      if (match) {
        // Success, current passwords match
        console.log('auth/changePassword: password hash match');
        // Hash the new password before storing it to database.
        newHash = bcrypt.hashSync(data.newPassword, 10);
        // Ready to change password. Update hash in database.
        users.findOneAndUpdate(query, { $set: {
          hash: newHash
        }}).then(function (updatedUser) {
          // Check if user still exists
          if (updatedUser === null) {
            console.error('auth/changePassword: ' +
                          'user removed during operation, not found');
            response({
              error: 'change-password-user-removed'
            })
            return;
          }
          // Password changed successfully
          response({
            success: 'change-password-success'
          });
          return;
        }).catch(function (err) {
          // Update query failed. Connection to database was lost or something.
          console.error(err);
          response({
            error: 'change-password-update-query-failure'
          });
          return;
        });
      }
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


exports.sendResetPasswordEmail = function (db, mailer, data, response) {
  // Parameters:
  //   db
  //     Monk db instance
  //   mailer
  //     Nodemailer transporter instance
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
    var url = 'http://localhost:3000/#reset=' + token;

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


exports.sendInviteEmail = function (db, data, response) {
  // Invite a user by sending an email with a link that includes a token.
  // With that token the user is allowed to create a single account within
  // a time limit.
  //
  // Parameters:
  //   db
  //     Monk db instance
  //   data
  //     plain object, Socket.io event payload:
  //       token
  //         Inveter's token.
  //         Used to check does inviter have privileges to invite.
  //       email
  //         The email address where to send the invite.
  //   response
  //     Socket.io response.

  throw new Error('not implemented');
};

exports.signUp = function (db, data, response) {
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

  throw new Error('not implemented');
};
