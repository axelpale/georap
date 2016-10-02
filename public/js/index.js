// var _ = require('lodash');
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
var SignUpFormController = require('./SignUpFormController');
var MapStateStore = require('./mapstate/Store');
var MapStateManager = require('./mapstate/Manager');

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
  // User has reseted a password. Display password reset form.

  // eslint-disable-next-line no-new
  new ResetFormController(card, auth, parsedHash.reset);
} else if (has.call(parsedHash, 'invite')) {
  // User has been invited. Display sign up form.

  // eslint-disable-next-line no-new
  new SignUpFormController(card, auth, parsedHash.invite);
} else if (!auth.hasToken()) {
  // Display login form and hide the map under it.

  // eslint-disable-next-line no-new
  new LoginFormController(card, auth);
}

// Display login form if user logs out.
auth.on('logout', function () {
  // eslint-disable-next-line no-new
  new LoginFormController(card, auth);
});

// Function initMap is called as jsonp call after Google Maps JS script is
// loaded.
window.initMap = function () {
  var map = new MapController(socket, auth);

  // eslint-disable-next-line no-new
  new MenuController(map, card, auth);

  // Remember map view state (center, zoom, type...)
  // Default to southern Finland.
  var stateStore = new MapStateStore(window.localStorage);
  // eslint-disable-next-line no-unused-vars
  var stateManager = new MapStateManager(map, stateStore, {
    lat: 61.0,
    lng: 24.0,
    zoom: 6,
    mapTypeId: 'hybrid',
  });
};
