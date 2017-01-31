// Routes
// ------
// This module is responsible for connecting incoming socket.io events
// to request handlers.

// Request handlers
var account = require('../handlers/account');
var locations = require('../handlers/locations');

module.exports = function (socket, db, mailer, host) {

  // Authentication
  socket.on('account/login', function (data, res) {
    account.login(db, data, res);
  });

  // Change password
  socket.on('account/changePassword', function (data, res) {
    account.changePassword(db, data, res);
  });

  // Password reset
  socket.on('account/sendResetPasswordEmail', function (data, res) {
    account.sendResetPasswordEmail(db, mailer, host, data, res);
  });
  socket.on('account/resetPassword', function (data, res) {
    account.resetPassword(db, data, res);
  });

  // Invitation & post-invite sign up
  socket.on('account/sendInviteEmail', function (data, res) {
    account.sendInviteEmail(db, mailer, host, data, res);
  });
  socket.on('account/signup', function (data, res) {
    account.signup(db, data, res);
  });

  // Locations

  socket.on('locations/put', function (data, res) {
    locations.put(db, data, res);
  });
  socket.on('locations/get', function (data, res) {
    locations.get(db, data, res);
  });
  socket.on('locations/del', function (data, res) {
    locations.del(db, data, res);
  });
  socket.on('locations/getMarkersWithin', function (data, res) {
    locations.getMarkersWithin(db, data, res);
  });

};
