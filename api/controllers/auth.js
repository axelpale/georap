var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var local = require('../../config/local');

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
        isAdmin: false
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
