// Usage:
//   var users = require('./stores/users');
//

var request = require('./lib/request');
var emitter = require('component-emitter');

// Init
emitter(exports);

// Public methods

exports.getAll = function (callback) {
  // Fetch a users from server and return array of raw user objects.
  // Will call back with error if not found.
  //
  // Parameters:
  //   callback
  //     function (err, users)
  //
  request.getJSON('/api/users', callback);
};

exports.getOneWithEvents = function (username, callback) {
  // Fetch a user from server and return raw user object.
  // Will call back with error if not found.
  //
  // Parameters:
  //   username
  //     string
  //   callback
  //     function (err, user)
  //
  request.getJSON('/api/users/' + username, callback);
};

exports.getVisitedLocationIds = function (username, callback) {
  // Parameters:
  //   username
  //   callback
  //     function (err, arrayOfLocationIds)
  request.getJSON('/api/users/' + username + '/visited', callback);
};
