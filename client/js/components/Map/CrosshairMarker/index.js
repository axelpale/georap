/* global google */

var icons = require('../lib/icons');
var getVisibleCenter = require('../lib/getVisibleCenter');
var setVisibleCenter = require('../lib/setVisibleCenter');
var bus = require('tresdb-bus');

module.exports = function (map) {

  var crosshairMarker = null;

  // Keep track if the marker is dragged or not.
  // This helps to determine should map pan change the marker position or not.
  // Dragging marker near the edge will pan the view,
  // which would cause the marker to flick between pointer and center,
  // if we do not care if marker is dragged or not.
  var dragged = false;

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
        draggable: true,
      });

      // Initial emit
      setTimeout(function () {
        bus.emit('crosshair_marker_moved', visCenter);
      }, 0);

      // See comment next to var dragged for details.
      crosshairMarker.addListener('dragstart', function () {
        dragged = true;
      });

      crosshairMarker.addListener('dragend', function () {
        // See comment next to var dragged for details.
        dragged = false;
        // Move the map so that the marker is at the middle.
        // This will fire map idle event which fires crosshair_marker_moved
        var crosshairLatLng = crosshairMarker.getPosition();
        // Convert to LatLngLiteral
        var panTarget = setVisibleCenter(crosshairLatLng.toJSON(), map);
        // Finally, pan the map.
        map.panTo(panTarget);
      });
    }
  };

  var updateMarker = function () {
    if (crosshairMarker && !dragged) {
      var visCenter = getVisibleCenter(map);
      crosshairMarker.setPosition(visCenter);
      // HACK A bit hacky way to pass marker position
      // HACK but passing through mapState or other store becomes complex
      // HACK because crosshair position is not map center.
      bus.emit('crosshair_marker_moved', visCenter);
    }
  };

  var hideMarker = function () {
    // Remove crosshair marker from the map.
    if (crosshairMarker) {
      google.maps.event.clearListeners(crosshairMarker, 'dragstart');
      google.maps.event.clearListeners(crosshairMarker, 'dragend');
      crosshairMarker.setMap(null);
      crosshairMarker = null;
    }
  };

  bus.on('crosshair_view_enter', showMarker);
  bus.on('crosshair_view_exit', hideMarker);

  map.addListener('idle', updateMarker);
};
