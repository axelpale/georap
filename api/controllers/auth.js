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
  users.findOne({email: data.email}).then(function (user) {

    if (user === null) {
      console.log('auth/login: user null, not found');
      response({
        error: 'login-invalid-email'
      });
      return;
    }

    var match = bcrypt.compareSync(data.password, user.hash);

    if (match) {
      // Success
      console.log('auth/login: password hash match');
      response({
        token: jwt.sign({ isAdmin: false }, local.secret)
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
