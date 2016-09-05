window._ = require('lodash');

// Precompiled Sails + Socket.io
require('file?name=js/sails.io.js!./dependencies/sails.io.js');

// Styles
require('../styles/style.css');

// Favicon
require('file?name=images/favicon.png!../images/favicon.png');

var cardTemplate = require('../templates/card.ejs');
var CardManager = require('./CardManager');

window.initMap = function () {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 61.498151, lng: 23.761025},
    zoom: 8,
    mapTypeId: 'hybrid'  // Darker and more practial than 'roadmap'.
  });

  var cm = new CardManager();

  (function initMapMenu() {
    // Main menu
    var menuDiv = document.createElement('div');
    menuDiv.className = 'tresdb-map-menu';

    /*(function defineAddButton() {
      var b = document.createElement('button');
      b.className = 'btn btn-default';
      b.innerHTML = 'Add';
      menuDiv.appendChild(b);

      b.addEventListener('click', function () {
        var m = new google.maps.Marker({
          position: map.getCenter(),
          title: 'New location',
          draggable: true,
          animation: google.maps.Animation.DROP
        });
        m.setMap(map);
      });
    }());*/

    (function defineLoginButton() {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn-primary';
      b.innerHTML = 'Login';
      menuDiv.appendChild(b);

      b.addEventListener('click', function openCard() {
        // Open a card over the map.
        var cardStr = cardTemplate({
          message: 'Kalkkipetteri'
        });
        cm.openCard(cardStr);
      });
    }());

    map.controls[google.maps.ControlPosition.LEFT_TOP].push(menuDiv);

  }());
};
