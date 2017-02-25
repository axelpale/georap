var icons = require('../lib/icons');

module.exports = function (map) {

  // Marker that represents geolocation of the user
  var geolocationMarker = null;
  var geolocationWatchId = null;

  this.hide = function () {
    // Stop watching device's location
    if (geolocationWatchId !== null) {
      if ('geolocation' in navigator) {
        navigator.geolocation.clearWatch(geolocationWatchId);
        geolocationWatchId = null;
      }
    }
    // Remove marker
    if (geolocationMarker !== null) {
      geolocationMarker.setMap(null);
      geolocationMarker = null;
    }
  };

  this.show = function () {
    // Show current location on the map. Does nothing if already shown.

    var update, geoSuccess, geoError, id;

    // If geolocation is not already shown and geolocation is available.
    if (geolocationMarker === null && 'geolocation' in navigator) {

      geolocationMarker = new google.maps.Marker({
        position: new google.maps.LatLng(0.0, 0.0),
        map: map,
        icon: icons.geolocation(),
      });

      update = function (lat, lng) {
        geolocationMarker.setPosition({
          lat: lat,
          lng: lng,
        });
      };

      geoSuccess = function (position) {
        update(position.coords.latitude, position.coords.longitude);
      };

      geoError = function (err) {
        console.error(err);
      };

      id = navigator.geolocation.watchPosition(geoSuccess, geoError);
      geolocationWatchId = id;

    }  // Else, no navigator.geolocation available
  };
};
