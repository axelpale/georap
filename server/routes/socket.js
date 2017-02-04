// Routes
// ------
// This module is responsible for connecting incoming socket.io events
// to request handlers.

// Request handlers
var account = require('../handlers/account');
var locations = require('../handlers/locations');

module.exports = function (socket) {

  // Authentication
  socket.on('account/login', account.login);
  // Change password
  socket.on('account/changePassword', account.changePassword);
  // Password reset
  socket.on('account/sendResetPasswordEmail', account.sendResetPasswordEmail);
  socket.on('account/resetPassword', account.resetPassword);
  // Invitation & post-invite sign up
  socket.on('account/sendInviteEmail', account.sendInviteEmail);
  socket.on('account/signup', account.signup);

  // Locations

  socket.on('locations/put', locations.put);
  socket.on('locations/get', locations.get);
  socket.on('locations/del', locations.del);

};
