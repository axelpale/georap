/* eslint-disable max-lines */
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

var storage = require('../../connection/storage');
var users = require('../users');
var emitter = require('component-emitter');
var jwtDecode = require('jwt-decode').default;
var request = require('../lib/request');
var roles = georap.config.roles;
var caps = georap.config.capabilities;

emitter(exports);

// Key of token in storage.
var TOKEN_KEY = 'georap-session-token';
// In-memory user to prevent hundreds of times JWT decrypts.
// Must be kept up-to-date.
// Can be null if user not authenticated.
// Init from storage.
var user = (function () {
  var token = storage.getItem(TOKEN_KEY);
  if (token) {
    var decoded = jwtDecode(token);
    if (decoded.exp > Date.now() / 1000) {
      // User still valid
      return decoded;
    }
  }
  return null;
}());


// Token methods without API calls

exports.getEmail = function () {
  if (user) {
    return user.email;
  }
  throw new Error('Non-existent user cannot have a name');
};

exports.getName = function () {
  // Return username as a string
  if (user) {
    return user.name;
  }
  throw new Error('Non-existent user cannot have a name');
};

exports.getRole = function () {
  if (user) {
    return user.role;
  }
  return 'public';
};

exports.getAssignableRoles = function () {
  // Return array of role names that the user is allowed to touch.
  // For example, a moderator cannot demote an admin but an admin can.
  if (user) {
    var authorRoleIndex = roles.indexOf(user.role);
    return roles.slice(0, authorRoleIndex + 1);
  }
  return [];
};

exports.getToken = function () {
  // Can be called only if isLoggedIn.
  if (user) {
    return storage.getItem(TOKEN_KEY);
  }
  throw new Error('The token is missing.');
};

exports.getUser = function () {
  // Get user object:
  // {
  //   name: <string>
  //   email: <string>
  //   role: <string>
  // }
  //
  // If no user set, will return null.
  //
  // TODO MAYBE If public user, will return
  //   {
  //     name: 'Anon',
  //     email: 'anonymous@example.com',
  //     role: 'public',
  //   }
  //
  return user;
};

exports.hasToken = function () {
  if (storage.getItem(TOKEN_KEY)) {
    return true;
  }
  return false;
};

exports.isAble =
exports.able = function (cap) {
  // Returns bool to tell if the user is capable of the given capability.
  //
  // Parameters
  //   cap
  //     string, a capability name
  //
  // Dev note: this fn does not make things more secure.
  //   This fn is only for user interface correctness.
  //   The real security must be enforced on server-side.
  //

  // Normalise to lower case
  var capn = cap.toLowerCase();

  // User role
  var role = 'public';
  if (user) {
    role = user.role;
  }

  if (caps[role]) {
    if (caps[role].indexOf(capn) > -1) {
      // User is able only if known user's role has the capability.
      return true;
    }
  }

  // User is not able
  return false;
};

exports.ableOwn = function (obj, capr) {
  // Takes a partial capability string and tests if user is
  // able to <capr>-any OR is an owner and is able to <capr>-own.
  // Simplifies testing -any and -own capabilities.
  //
  // Parameters
  //   obj
  //     object with prop 'user'
  //   capr
  //     a partial capability string without -any or -own postfix
  //
  // Return
  //   boolean
  //
  if (user) {
    if (exports.isAble(capr + '-any')) {
      return true;
    }
    if (user.name === obj.user && exports.isAble(capr + '-own')) {
      return true;
    }
  }
  return false;
};

exports.isAdmin = function () {
  // Return
  //   bool, true if admin, false if not admin or not logged in.
  //
  if (user && user.role === 'admin') {
    return true;
  }
  return false;
};

exports.isLoggedIn = function () {
  // True if user is authenticated. Requires the token to be valid.
  //
  if (user && user.role !== 'public') {
    return true;
  }
  return false;
};

exports.isMe = function (username) {
  // Test if current user has this username.
  if (user) {
    return username === user.name;
  }
  return false;
};

exports.isRoleAble = function (role, cap) {
  // Tells if the given role has the given capability.
  //

  // Normalise to lower case
  var capn = cap.toLowerCase();
  // Role is able only if it is configured and has capability.
  if (caps[role]) {
    if (caps[role].indexOf(capn) > -1) {
      return true;
    }
  }
  return false;
};

exports.logout = function (callback) {
  // Parameters:
  //   callback
  //     function (err), if successful, err === null
  // Emits:
  //   logout
  //     On successful logout

  // NOTE The token is removed but the server will still accept it
  // until the token has expired. This is a feature/weakness of JWT token.

  user = null;
  storage.removeItem(TOKEN_KEY);
  exports.emit('logout');

  if (typeof callback !== 'undefined') {
    return callback(null);
  }
};

exports.setToken = function (token) {
  // Set token. Ensure token validity.
  //
  // Parameters
  //   token
  //     string, a JWT token
  //
  // Return
  //   boolean, true if token set successful, false otherwise.
  if (token) {
    var decoded = jwtDecode(token);
    if (decoded.exp > Date.now() / 1000) {
      // Success
      user = decoded;
      storage.setItem(TOKEN_KEY, token);
      return true;
    }
  }

  // Else invalid. It is best to log the user out.
  user = null;
  storage.removeItem(TOKEN_KEY);
  return false;
};


// API methods

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

      // Set / replace auth token
      exports.setToken(tokenResponse);

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

exports.changeEmailSendCode = function (newEmail, callback) {
  // Parameters:
  //   newEmail
  //     string, email address where
  //       the email verification message
  //       will be sent.
  //   callback
  //     function (err, { message })
  //
  return request.postJSON({
    url: '/api/account/email',
    data: {
      newEmail: newEmail,
    },
  }, function (err, response) {
    if (err) {
      return callback(err);
    }
    return callback(null, {
      message: response.message,
    });
  });
};

exports.changeEmailSave = function (currentPwd, securityCode, callback) {
  // Parameters:
  //   currentPwd
  //     string, current password
  //   securityCode
  //     integer, six-digit
  //   callback
  //     function (err, { key, validPassword, validCode })
  //
  return request.postJSON({
    url: '/api/account/email/' + securityCode + '/',
    data: {
      password: currentPwd,
    },
  }, function (err, response) {
    if (err) {
      return callback(err);
    }

    // Update auth token because its email changes.
    if (response.token) {
      exports.setToken(response.token);
    }

    return callback(null, {
      newEmail: response.newEmail,
      oldEmail: response.oldEmail,
    });
  });
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

exports.sendInviteEmail = function (params, callback) {
  // Parameters
  //   params
  //     email
  //       string, valid email
  //     lang
  //       string, a locale string e.g. 'en'. If server does not support
  //       the selected locale, the invitation is sent in the default lang.
  //     role
  //       string, a user role.
  //   callback
  //     function
  //
  request.postJSON({
    url: '/api/account/invite',
    data: {
      email: params.email,
      lang: params.lang,
      role: params.role,
    },
  }, callback);
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

exports.getVisitedLocationIds = function (callback) {
  // Return array of ids of locations that the user has visited.
  return users.getVisitedLocationIds(exports.getName(), callback);
};

exports.getFlags = function (callback) {
  // Parameters:
  //   callback
  //     fn (err, flags) where
  //       flags is a mapping locationId -> array of flags set by the user
  //
  return users.getFlags(exports.getName(), callback);
};
