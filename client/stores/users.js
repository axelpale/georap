// Usage:
//   var users = georap.stores.users;
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
  // DEV NOTE
  // If you need to order the users, then order them on the client side.
  //
  // Parameters:
  //   callback
  //     function (err, users)
  //
  request.getJSON({
    url: '/api/users',
  }, callback);
};

exports.getOne = function (username, callback) {
  // Fetch a user from server and return raw user object.
  // Will call back with error if not found.
  //
  // Parameters:
  //   username
  //     string
  //   callback
  //     function (err, user)
  //
  request.getJSON({
    url: '/api/users/' + username,
  }, callback);
};

exports.getEvents = function (params, callback) {
  // Get recent events by user.
  //
  // Parameters:
  //   params
  //     username
  //       string
  //     skip
  //       integer, how many to skip before results. Default 0.
  //     limit
  //       integer, how many to include into the results. Default 50.
  //   callback
  //     function (err, events)
  //       Parameters:
  //         err
  //         events
  //           array, most recent event first
  //
  params = Object.assign({
    skip: 0,
    limit: 50,
  }, params);

  request.getJSON({
    url: '/api/users/' + params.username + '/events',
    data: {
      skip: params.skip,
      limit: params.limit,
    },
  }, function (err, response) {
    if (err) {
      return callback(err);
    }
    return callback(null, response.events);
  });
};

exports.getVisitedLocationIds = function (username, callback) {
  // Parameters:
  //   username
  //   callback
  //     function (err, arrayOfLocationIds)
  request.getJSON({
    url: '/api/users/' + username + '/visited',
  }, function (err, ids) {
    if (err) {
      console.error(err);
      return callback(err, null);
    }

    return callback(null, ids);
  });
};

exports.getFlags = function (username, callback) {
  // Parameters:
  //   username
  //   callback
  //     function (err, flagsObj) where
  //       flagsObj: locationId -> array of flags
  //
  request.getJSON({
    url: '/api/users/' + username + '/flags',
  }, function (err, result) {
    if (err) {
      return callback(err);
    }
    return callback(null, result.flags);
  });
};
