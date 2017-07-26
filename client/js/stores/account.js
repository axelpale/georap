// Account
//
// Responsible:
// - authentication login
// - data of the current user
// - account related communication with the server
// - handling auth tokens in browser memory
//
// Not responsible:
// - validation of input values
//
//
// Emits:
//   login
//   logout

var storage = require('../connection/storage');
var api = require('../connection/api');
var users = require('./users');
var emitter = require('component-emitter');
var jwtDecode = require('jwt-decode');

emitter(exports);

// Key of token in storage.
var TOKEN_KEY = api.getTokenKey();

exports.login = function (email, password, callback) {
  // Parameters:
  //   email
  //     email address
  //   password
  //   callback
  //     function (err), optional
  //
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

  $.ajax({
    url: '/api/account/',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(payload),
    success: function (tokenResponse) {

      if (typeof tokenResponse !== 'string') {
        throw new Error('invalid server response');
      }

      storage.setItem(TOKEN_KEY, tokenResponse);

      // Publish within client
      exports.emit('login');

      return callback();
    },
    error: function (jqxhr) {
      var err = new Error(jqxhr.responseText);
      err.name = jqxhr.statusText;
      err.code = jqxhr.status;
      return callback(err);
    },
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

  $.ajax({
    url: '/api/account/password',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(payload),
    headers: { 'Authorization': 'Bearer ' + exports.getToken() },
    success: function () {
      return callback();
    },
    error: function (jqxhr, status, errMsg) {
      var err = new Error(errMsg);
      console.error(err);
      return callback(err);
    },
  });
};

exports.isMe = function (username) {
  // Test if current user has this username.
  return username === this.getName();
};

exports.sendResetPasswordEmail = function (email, callback) {

  $.ajax({
    url: '/api/account/reset/email',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ email: email }),
    success: function () {
      return callback();
    },
    error: function (jqxhr, status, errMsg) {
      var err = new Error(errMsg);
      console.error(err);
      return callback(err);
    },
  });
};

exports.resetPassword = function (resetToken, newPassword, callback) {

  $.ajax({
    url: '/api/account/reset',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ password: newPassword }),
    headers: { 'Authorization': 'Bearer ' + resetToken },
    success: function () {
      return callback();
    },
    error: function (jqxhr, status, errMsg) {
      var err = new Error(errMsg);
      console.error(err);
      return callback(err);
    },
  });
};

exports.sendInviteEmail = function (email, callback) {

  $.ajax({
    url: '/api/account/invite',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ email: email }),
    headers: { 'Authorization': 'Bearer ' + exports.getToken() },
    success: function () {
      return callback();
    },
    error: function (jqxhr, status, errMsg) {
      var err = new Error(errMsg);
      console.error(err);
      return callback(err);
    },
  });
};

exports.signup = function (signupToken, username, password, callback) {
  // Parameters
  //   signupToken
  //     The token user received in email. Contains email address
  //   username
  //   password
  //   callback

  var payload = {
    username: username,
    password: password,
  };

  $.ajax({
    url: '/api/account/signup',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(payload),
    headers: { 'Authorization': 'Bearer ' + signupToken },
    success: function () {
      return callback();
    },
    error: function (jqxhr, status, errMsg) {
      var err = new Error(errMsg);
      console.error(err);
      return callback(err);
    },
  });
};

exports.isLoggedIn = function () {
  // True if user is authenticated.

  if (storage.getItem(TOKEN_KEY) !== null) {
    return true;
  }

  return false;
};

exports.isAdmin = function () {
  // Return
  //   bool, true if admin, false if not admin or not logged in.

  if (exports.isLoggedIn()) {
    return exports.getUser().admin;
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

exports.getEmail = function () {
  return exports.getUser().email;
};

exports.getName = function () {
  // Return username as a string
  return exports.getUser().name;
};

exports.getVisitedLocationIds = function (callback) {
  // Return array of ids of locations that the user has visited.
  return users.getVisitedLocationIds(exports.getName(), callback);
};
