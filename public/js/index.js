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

window.initMap = function () {

  var auth = new AuthController(socket, window.localStorage);
  var map = new MapController(socket, auth);
  var card = new CardController();
  var menu = new MenuController(map, card, auth);

};
