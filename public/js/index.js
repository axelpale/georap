var _ = require('lodash');

var CardController = require('./CardController');
var AuthController = require('./AuthController');
var MenuController = require('./MenuController');

window.initMap = function () {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 61.498151, lng: 23.761025},
    zoom: 8,
    mapTypeId: 'hybrid'  // Darker and more practial than 'roadmap'.
  });

  var card = new CardController();
  var auth = new AuthController(null, window.localStorage);
  var menu = new MenuController(map, card, auth);

};
