var _ = require('lodash');

var MapController = require('./MapController');
var CardController = require('./CardController');
var AuthController = require('./AuthController');
var MenuController = require('./MenuController');

window.initMap = function () {

  var map = new MapController();
  var card = new CardController();
  var auth = new AuthController(null, window.localStorage);
  var menu = new MenuController(map, card, auth);

};
