/* global google */

var icons = require('../lib/icons');
var getVisibleCenter = require('../lib/getVisibleCenter');
var bus = require('tresdb-bus');

module.exports = function (map) {

  var crosshairMarker = null;

  var showMarker = function () {
    // Reveal the crosshair.
    //
    if (!crosshairMarker) {

      // Wait until map has projection to getVisibleCenter.
      // See convert.point2LatLng for details.
      var pev = 'projection_changed';
      if (!map.getProjection()) {
        google.maps.event.addListenerOnce(map, pev, function () {
          showMarker();
        });
        return;
      }

      var visCenter = getVisibleCenter(map); // LatLng literal
      crosshairMarker = new google.maps.Marker({
        position: visCenter, // LatLng literal
        map: map,
        icon: icons.crosshair(),
        draggable: false,
      });
      // Initial emit
      setTimeout(function () {
        bus.emit('crosshair_moved', visCenter);
      }, 0);
    }
  };

  var updateMarker = function () {
    if (crosshairMarker) {
      var visCenter = getVisibleCenter(map);
      crosshairMarker.setPosition(visCenter);
      // HACK A bit hacky way to pass marker position
      // HACK but passing through mapState or other store becomes complex
      // HACK because crosshair position is not map center.
      bus.emit('crosshair_moved', visCenter);
    }
  };

  var hideMarker = function () {
    // Remove crosshair marker from the map.
    if (crosshairMarker) {
      crosshairMarker.setMap(null);
      crosshairMarker = null;
    }
  };

  bus.on('crosshair_view_enter', showMarker);
  bus.on('crosshair_view_exit', hideMarker);

  map.addListener('idle', updateMarker);
};
