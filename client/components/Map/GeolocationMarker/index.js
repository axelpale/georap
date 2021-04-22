/* global google */

var icons = require('../lib/icons');

var ICON_SIZE = 30; // 18
var TRACKING_X = 240; // 144
var ANIMATION_INTERVAL = 500;

module.exports = function (map) {

  // Marker that represents geolocation of the user
  var marker = null;
  var watchId = null;

  // We want to do special stuff on the first geolocation watch update.
  var firstUpdate = true;


  // Private methods

  var _showMarker = function (latlng) {
    // Show current location on the map or update the location.
    if (marker === null) {
      marker = new google.maps.Marker({
        position: latlng,
        map: map,
        icon: icons.geolocation(),
      });
    } else {
      marker.setPosition(latlng);
    }
  };

  var _hideMarker = function () {
    // Remove marker
    if (marker !== null) {
      marker.setMap(null);
      marker = null;
    }
  };


  // Public methods

  this.bind = function () {

    // See https://stackoverflow.com/a/34609371/638546
    var controlDiv = document.createElement('div');

    var firstChild = (function defineFirstChild() {
      var el = document.createElement('button');
      el.className = 'tresdb-geolocation';
      el.title = 'Your Location';
      return el;
    }());
    controlDiv.appendChild(firstChild);

    var secondChild = (function defineSecondChild() {
      var el = document.createElement('div');
      el.className = 'tresdb-geolocation-icon';
      return el;
    }());
    firstChild.appendChild(secondChild);

    var searchAnimation = (function () {
      var animationInterval = null;
      var imgX = 0;

      return {
        start: function () {
          animationInterval = setInterval(function () {
            imgX = -imgX - ICON_SIZE;
            secondChild.style['background-position'] = imgX + 'px 0';
          }, ANIMATION_INTERVAL);
        },
        stop: function () {
          if (animationInterval !== null) {
            clearInterval(animationInterval);
          }
          secondChild.style['background-position'] = '0 0';
        },
      };
    }());

    var trackAnimation = (function () {
      var animationInterval = null;
      var phase = false;

      return {
        start: function () {
          animationInterval = setInterval(function () {
            phase = !phase;
            var imgX = -TRACKING_X - (phase ? -(2 * ICON_SIZE) : ICON_SIZE);
            secondChild.style['background-position'] = imgX + 'px 0';
          }, ANIMATION_INTERVAL);
        },
        stop: function () {
          if (animationInterval !== null) {
            clearInterval(animationInterval);
          }
          secondChild.style['background-position'] = '0 0';
        },
      };
    }());

    // Toggle tracking on/off by click
    firstChild.addEventListener('click', function () {

      if (watchId === null) {
        // Not tracking. Get the location, and show marker.
        searchAnimation.start();

        if (navigator.geolocation) {
          watchId = navigator.geolocation.watchPosition(function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            var latlng = new google.maps.LatLng(lat, lng);

            _showMarker(latlng);

            if (firstUpdate) {
              map.setCenter(latlng);
              searchAnimation.stop();
              trackAnimation.start();
              firstUpdate = false;
            }
          }, function geoError(err) {
            console.error(err);
          }, {
            enableHighAccuracy: true,
          });
        } else {
          searchAnimation.stop();
        }
      } else {
        // Already tracking, so turn tracking off and hide the marker.
        _hideMarker();
        trackAnimation.stop();
        searchAnimation.stop();  // Might be running

        // Reset watch
        firstUpdate = true;
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    });

    controlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
  };

};
