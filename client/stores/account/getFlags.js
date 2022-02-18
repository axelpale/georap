var userStore = require('./user');
var usersApi = require('../users');

module.exports = function (callback) {
  // Parameters:
  //   callback
  //     fn (err, flags) where
  //       flags is a mapping locationId -> array of flags set by the user
  //
  var username = userStore.getName();
  return usersApi.getFlags(username, callback);
};
