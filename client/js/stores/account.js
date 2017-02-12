// Account
//
// Responsible:
// - authentication login
// - current user data
// - communication with the server
// - handling tokens in browser memory
//
// Not responsible:
// - validation of input values
//
//
// Emits:
//   login
//   logout

var emitter = require('component-emitter');
var jwtDecode = require('jwt-decode');
var storage = require('../connection/storage');
var api = require('../connection/api');

emitter(exports);

var TOKEN_KEY = api.getTokenKey();

exports.login = function (email, password, callback) {
  // Parameters:
  //   email
  //     email address
  //   password
  //   callback
  //     function (err), optional
  // Emits:
  //   login
  //     On successful login.

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new Error('invalid parameters');
  }

  var payload = {
    email: email,
    password: password,
  };

  if (typeof callback !== 'function') {
    callback = function () {};
  }

  api.requestRaw('account/login', payload, function (err, token) {
    if (err) {
      return callback(err);
    }

    if (typeof token !== 'string') {
      throw new Error('invalid server response');
    }

    storage.setItem(TOKEN_KEY, token);

    // Publish within client
    exports.emit('login');

    return callback(null);
  });
};

exports.logout = function (callback) {
  // Parameters:
  //   callback
  //     function (err), if successful, err === null
  // Emits:
  //   logout
  //     On successful logout

  // TODO ask server to invalidate the token.

  storage.removeItem(TOKEN_KEY);
  exports.emit('logout');

  if (typeof callback !== 'undefined') {
    return callback(null);
  }
};

exports.changePassword = function (currentPassword, newPassword, callback) {
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
    currentPassword: currentPassword,
    newPassword: newPassword,
  };

  api.request('account/changePassword', payload, callback);
};

exports.sendResetPasswordEmail = function (email, callback) {

  // Data to send to server.
  var payload = {
    email: email,
  };

  api.requestRaw('account/sendResetPasswordEmail', payload, callback);
};

exports.resetPassword = function (token, newPassword, callback) {

  var payload = {
    token: token,
    password: newPassword,
  };

  api.requestRaw('account/resetPassword', payload, callback);
};

exports.sendInviteEmail = function (email, callback) {

  var payload = {
    email: email,
  };

  api.request('account/sendInviteEmail', payload, callback);
};

exports.signup = function (token, username, password, callback) {
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

  api.requestRaw('account/signup', payload, callback);
};

exports.isLoggedIn = function () {
  // True if user is authenticated.

  if (storage.getItem(TOKEN_KEY) !== null) {
    return true;
  }

  return false;
};

exports.getToken = function () {
  // Can be called only if isLoggedIn.
  if (!exports.isLoggedIn()) {
    throw new Error('The token is missing.');
  }

  return storage.getItem(TOKEN_KEY);
};

exports.getUser = function () {
  // Get user object:
  // {
  //   name: <string>
  //   email: <string>
  //   admin: <bool>
  // }
  //
  // Can be called only if isLoggedIn.
  if (!exports.isLoggedIn()) {
    throw new Error('Cannot get payload because missing token.');
  }

  return jwtDecode(storage.getItem(TOKEN_KEY));
};

exports.getName = function () {
  // Return username as a string
  return exports.getUser().name;
};
