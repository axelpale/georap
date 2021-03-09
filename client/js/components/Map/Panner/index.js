/* global google */
var getPanTarget = require('./getPanTarget');

module.exports = function (map) {

  var self = this;

  // When location page opens, map pans so that location becomes visible
  // on the background. After location page is closed, this pan is being
  // undone. We only need to remember the original map center.
  var _panUndoLatLng = null;

  // Public methods

  self.panForCard = function (geom) {
    // Pan map so that the given geom becomes centered on
    // the visible portion of the map.
    //
    // Parameters:
    //   geom
    //     GeoJSON Point

    // Wait until map has projection.
    // See convert.point2LatLng for details.
    var pev = 'projection_changed';
    if (!map.getProjection()) {
      google.maps.event.addListenerOnce(map, pev, function () {
        self.panForCard(geom);
      });
      return;
    }

    // Store current, original center for undo.
    _panUndoLatLng = map.getCenter();

    var targetLatLng = getPanTarget(geom, map);
    map.panTo(targetLatLng);
  };

  self.panUndo = function () {
    // Undo the pan
    if (_panUndoLatLng) {
      map.panTo(_panUndoLatLng);
    }
  };
};
