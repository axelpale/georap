window._ = require('lodash');

// Precompiled Sails + Socket.io
require('file?name=js/sails.io.js!./dependencies/sails.io.js');

// Styles
require('../styles/style.css');

// Favicon
require('file?name=images/favicon.png!../images/favicon.png');

// Templates
var loginTemplate = require('../templates/login.ejs');

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
        // Open a login card over the map.
        cm.openCard(loginTemplate());

        $('#tresdb-login-form').submit(function (ev) {
          console.log('Login form submitted');
          io.socket.get('/hello', function (data, res) {
            console.log('GET hello response');
            console.log(data);
          });
          io.socket.post('/hello', { msg: 'Hello world' }, function (data, res) {
            console.log('POST hello response');
            console.log(data);
          });
          ev.preventDefault();
        });
      });
    }());

    map.controls[google.maps.ControlPosition.LEFT_TOP].push(menuDiv);

  }());
};
