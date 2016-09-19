var _ = require('lodash');
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

var auth = new AuthController(socket, window.localStorage);
var card = new CardController();

// Display login form and hide the map under it.
var login = new LoginFormController(card, auth);
// Display login form if user logs out.
auth.on('logout', function () {
  login = new LoginFormController(card, auth);
});

// Function initMap is called as jsonp call after Google Maps JS script is
// loaded.
window.initMap = function () {
  var map = new MapController(socket, auth);
  var menu = new MenuController(map, card, auth);
};
