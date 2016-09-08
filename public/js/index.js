var _ = require('lodash');
var io = require('socket.io-client');
var socket = io('/');

var MapController = require('./MapController');
var CardController = require('./CardController');
var AuthController = require('./AuthController');
var MenuController = require('./MenuController');

window.initMap = function () {

  var map = new MapController();
  var card = new CardController();
  var auth = new AuthController(socket, window.localStorage);
  var menu = new MenuController(map, card, auth);

};
