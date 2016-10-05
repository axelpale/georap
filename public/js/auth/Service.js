//
// Responsible:
// - communication with the server
// - handling tokens in browser memory
//
// Not responsible:
// - validation of input values
//

var Emitter = require('component-emitter');
var jwtDecode = require('jwt-decode');

var TOKEN_KEY = 'tresdb-session-token';

module.exports = function (socket, storage) {
  // Parameters:
  //   socket
  //   storage
  // Emits:
  //   login
  //   logout
  Emitter(this);
  var self = this;

  this.login = function (email, password, callback) {
    // Parameters:
    //   email
    //     email address
    //   password
    //   callback
    //     function (err)
    // Emits:
    //   login
    //     On successful login.

    var payload = {
      email: email,
      password: password,
    };

    socket.emit('auth/login', payload, function (response) {
      if (response.hasOwnProperty('token')) {
        // Success
        storage.setItem(TOKEN_KEY, response.token);
        // Publish within client
        self.emit('login');
        if (typeof callback === 'function') {
          return callback(null);
        }
      } else if (response.hasOwnProperty('error')) {
        // Failure
        if (typeof callback === 'function') {
          return callback({
            name: response.error,
          });
        }
      } else {
        // Error
        console.error('Invalid response to loginRequest');
      }
    });
  };

  this.logout = function (callback) {
    // Parameters:
    //   callback
    //     function (err), if successful, err === null
    // Emits:
    //   logout
    //     On successful logout

    // TODO ask server to invalidate the token.

    storage.removeItem(TOKEN_KEY);
    self.emit('logout');

    if (typeof callback !== 'undefined') {
      return callback(null);
    }
  };

  this.changePassword = function (currentPassword, newPassword, callback) {
    // Change user password. Requires token to be set.
    //
    // Parameters:
    //   currentPassword
    //     Server ensures that user knows the current password before
    //     changing.
    //   newPassword
    //   callback
    //     function (err). If success, err is null.

    // Data to send to server.
    var payload = {
      token: this.getToken(),
      currentPassword: currentPassword,
      newPassword: newPassword,
    };

    // Ask server to change the password.
    socket.emit('auth/changePassword', payload, function (response) {
      if (response.hasOwnProperty('error')) {
        return callback({
          name: response.error,
        });
      }  // else
      if (response.hasOwnProperty('success')) {
        return callback(null);
      }  // else
      console.error('Invalid response from auth/changePassword');
    });
  };

  this.sendResetPasswordEmail = function (email, callback) {

    // Data to send to server.
    var payload = {
      email: email,
    };

    socket.emit('auth/sendResetPasswordEmail', payload, function (response) {
      if (response.hasOwnProperty('error')) {
        return callback({
          name: response.error,
        });
      }  // else
      if (response.hasOwnProperty('success')) {
        return callback(null);
      }  // else
      console.error('Invalid response from auth/sendResetPasswordEmail');
    });
  };

  this.resetPassword = function (token, newPassword, callback) {

    var payload = {
      token: token,
      password: newPassword,
    };

    socket.emit('auth/resetPassword', payload, function (response) {
      if (response.hasOwnProperty('error')) {
        return callback({
          name: response.error,
        });
      }  // else
      if (response.hasOwnProperty('success')) {
        return callback(null);
      }  // else
      console.error('Invalid response from auth/resetPassword');
    });
  };

  this.sendInviteEmail = function (email, callback) {

    var payload = {
      token: this.getToken(),
      email: email,
    };

    socket.emit('auth/sendInviteEmail', payload, function (response) {
      if (response.hasOwnProperty('error')) {
        return callback({
          name: response.error,
        });
      }  // else
      if (response.hasOwnProperty('success')) {
        return callback(null);
      }  // else
      console.error('Invalid response from auth/sendInviteEmail');
    });
  };

  this.signup = function (token, username, password, callback) {
    // Parameters
    //   token
    //     The token user received in email. Contains email address
    //   username
    //   password
    //   callback

    var payload = {
      token: token,
      username: username,
      password: password,
    };

    socket.emit('auth/signup', payload, function (response) {
      console.log('auth/signup socket responsed.');
      if (response.hasOwnProperty('error')) {
        console.log(response.error);

        return callback({
          name: response.error,
        });
      }  // else
      if (response.hasOwnProperty('success')) {
        return callback(null);
      }  // else
      console.error('Invalid response from auth/sendInviteEmail');
    });
  };

  this.isLoggedIn = function () {
    // True if user is authenticated.

    if (storage.getItem(TOKEN_KEY) !== null) {
      return true;
    }

    return false;
  };

  this.getToken = function () {
    // Can be called only if isLoggedIn.
    if (!this.isLoggedIn()) {
      throw new Error('The token is missing.');
    }

    return storage.getItem(TOKEN_KEY);
  };

  this.getUser = function () {
    // Get user object:
    // {
    //   name: <string>
    //   email: <string>
    //   admin: <bool>
    // }
    //
    // Can be called only if isLoggedIn.
    if (!this.isLoggedIn()) {
      throw new Error('Cannot get payload because missing token.');
    }

    return jwtDecode(storage.getItem(TOKEN_KEY));
  };
};
