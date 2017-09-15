// Usage:
//   var users = require('./stores/users');
//

var request = require('./lib/request');
var emitter = require('component-emitter');

// Init
emitter(exports);

// Public methods

exports.getUsers = function (callback) {
  // Fetch a users from server and return array of raw user objects.
  // The user objects will have email property but no hash property.
  // Will call back with error if not found.
  //
  // Parameters:
  //   callback
  //     function (err, users)
  //
  request.getJSON('/api/admin/users', callback);
};


exports.getUser = function (username, callback) {
  // Fetch one user with admin-only data.
  request.getJSON('/api/admin/users/' + username, callback);
};


exports.setRole = function (username, isAdmin, callback) {
  // Parameters:
  //   username
  //     string
  //   isAdmin
  //     boolean
  //   callback
  //     function (err)
  //

  if (typeof isAdmin !== 'boolean') {
    throw new Error('invalid role');
  }

  request.postJSON({
    url: '/api/admin/users/' + username + '/role',
    data: {
      isAdmin: isAdmin,
    },
  }, callback);
};


exports.setStatus = function (username, isActive, callback) {
  // Parameters:
  //   username
  //     string
  //   isActive
  //     boolean
  //   callback
  //     function (err)
  //

  // Assert parameters
  if (typeof username !== 'string' ||
      typeof isActive !== 'boolean' ||
      typeof callback !== 'function') {
    throw new Error('invalid parameters');
  }

  request.postJSON({
    url: '/api/admin/users/' + username + '/status',
    data: {
      isActive: isActive,
    },
  }, callback);
};
