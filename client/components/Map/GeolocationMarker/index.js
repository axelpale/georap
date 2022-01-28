/* global google */

var icons = require('../lib/icons');
var navi = window.navigator;

var ICON_SIZE = 30; // 18
var TRACKING_X = 240; // 144
var ANIMATION_INTERVAL = 500;

module.exports = function (map) {

  // The button
  var controlDiv = null;

  // Marker that represents geolocation of the user
  var marker = null;
  var watchId = null;

  // We want to do special stuff on the first geolocation watch update.
  var firstUpdate = true;

  // Animations
  var searchAnimation = null;
  var trackAnimation = null;

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
    controlDiv = document.createElement('div');

    var firstChild = (function defineFirstChild() {
      var el = document.createElement('button');
      el.className = 'georap-geolocation';
      el.title = 'Your Location';
      return el;
    }());
    controlDiv.appendChild(firstChild);

    var secondChild = (function defineSecondChild() {
      var el = document.createElement('div');
      el.className = 'georap-geolocation-icon';
      return el;
    }());
    firstChild.appendChild(secondChild);

    searchAnimation = (function () {
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

    trackAnimation = (function () {
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

        if (navi.geolocation) {
          watchId = navi.geolocation.watchPosition(function (position) {
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
        navi.geolocation.clearWatch(watchId);
        watchId = null;
      }
    });

    controlDiv.index = 1;
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(controlDiv);
  };

  this.unbind = function () {
    if (controlDiv) {
      _hideMarker();
      // Stop possible button animations
      trackAnimation.stop();
      searchAnimation.stop();
      // Reset navi watch
      firstUpdate = true;
      navi.geolocation.clearWatch(watchId);
      watchId = null;
      // Remove button; first find index and then del so del not affect index.
      var controls = map.controls[google.maps.ControlPosition.LEFT_BOTTOM];
      var index = -1;
      controls.forEach(function (el, i) {
        if (el === controlDiv) {
          index = i;
        }
      });
      if (index >= 0) {
        controls.removeAt(index);
      }
      // var length = controls.getLength();
      // for (index = 0; index < length; index += 1) {
      //   if (controls.getAt)
      // }
      controlDiv = null;
      map = null;
    }
  };

};
