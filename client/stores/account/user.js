var storage = require('../../connection/storage');
var bus = require('georap-bus');
var jwtDecode = require('jwt-decode').default;
var roles = georap.config.roles;
var caps = georap.config.capabilities;

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

exports.ableAny = function (caplist) {
  // Return bool to tell if the user is capable of at least one of the given
  // list of capabilities.
  //
  // Parameters
  //   caplist
  //     array of strings
  //

  // User role
  var role = 'public';
  if (user) {
    role = user.role;
  }

  if (caps[role]) {
    for (var i = 0; i < caplist.length; i += 1) {
      if (caps[role].indexOf(caplist[i]) > -1) {
        // Break at first match
        return true;
      }
    }
    // User not able at all
    return false;
  }

  // No such role
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
  bus.emit('logout');

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
