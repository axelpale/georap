var _ = require('lodash');
var queryString = require('query-string');
var io = require('socket.io-client');
var socket = io('/');

// Connection error handling
socket.on('connect-error', function () {
  console.error('TresDB: io connect-error');
});

var MapController = require('./MapController');
var CardController = require('./CardController');
var AuthController = require('./AuthController');
var MenuController = require('./MenuController');
var LoginFormController = require('./LoginFormController');
var ResetFormController = require('./ResetFormController');

var auth = new AuthController(socket, window.localStorage);
var card = new CardController();

// What to show first:
//   If about to reset password
//     Show reset form.
//   If arrived through invite link
//     Show set account form.
//   If not logged in
//     Show login form
var parsedHash = queryString.parse(location.hash);
// parsedHash does not have prototype, thus complicated call.
var has = Object.prototype.hasOwnProperty;
if (has.call(parsedHash, 'reset')) {
  // Display password reset form
  console.log('Password reset detected');
  new ResetFormController(card, auth, parsedHash['reset']);
} else if (has.call(parsedHash, 'invite')) {
  console.log('Invite detected');
} else if (!auth.hasToken()) {
  // Display login form and hide the map under it.
  new LoginFormController(card, auth);
}

// Display login form if user logs out.
auth.on('logout', function () {
  new LoginFormController(card, auth);
});

// Function initMap is called as jsonp call after Google Maps JS script is
// loaded.
window.initMap = function () {
  var map = new MapController(socket, auth);
  var menu = new MenuController(map, card, auth);
};
