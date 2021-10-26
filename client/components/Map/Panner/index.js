/* global google */
var setVisibleCenter = require('../lib/setVisibleCenter');

module.exports = function (map) {

  var self = this;

  // When location page opens, map pans so that location becomes visible
  // on the background. After location page is closed, this pan is being
  // undone. We only need to remember the original map center.
  var _panUndoLatLng = null;

  // Public methods

  self.panForCard = function (latLng) {
    // Pan map so that the given geom becomes centered on
    // the visible portion of the map.
    //
    // Parameters:
    //   latLng
    //     LatLngLiteral
    //       { lat, lng }
    //

    // Wait until map has projection.
    // See convert.point2LatLng for details.
    var pev = 'projection_changed';
    if (!map.getProjection()) {
      google.maps.event.addListenerOnce(map, pev, function () {
        self.panForCard(latLng);
      });
      return;
    }

    // Store current, original center for undo.
    _panUndoLatLng = map.getCenter();

    var targetLatLng = setVisibleCenter(latLng, map);
    map.panTo(targetLatLng);
  };

  self.panUndo = function () {
    // Undo the pan
    if (_panUndoLatLng) {
      map.panTo(_panUndoLatLng);
    }
  };
};
