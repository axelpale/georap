/* global google */

var icons = require('../lib/icons');
var getVisibleCenter = require('../lib/getVisibleCenter');
var bus = require('tresdb-bus');

module.exports = function (map) {

  var self = this;
  // Creates a draggable marker at the middle of the map.
  var crosshairMarker = null;

  this.show = function () {
    // Reveal the crosshair.
    //
    if (!crosshairMarker) {

      // Wait until map has projection to getVisibleCenter.
      // See convert.point2LatLng for details.
      var pev = 'projection_changed';
      if (!map.getProjection()) {
        google.maps.event.addListenerOnce(map, pev, function () {
          self.show();
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
    }
  };

  this.update = function () {
    if (crosshairMarker) {
      var vcenter = getVisibleCenter(map);
      crosshairMarker.setPosition(vcenter);
      // HACK A bit hacky way to pass marker position
      // HACK but passing through mapState or other store becomes complex
      // HACK because crosshair position is not map center.
      bus.emit('crosshair_moved', vcenter);
    }
  };

  this.hide = function () {
    // Remove crosshair marker from the map.
    if (crosshairMarker) {
      crosshairMarker.setMap(null);
      crosshairMarker = null;
    }
  };
};
