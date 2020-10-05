/* global google */

var convert = require('./lib/convert');

var getPanTarget = function (locGeom, map) {
  var lat = locGeom.coordinates[1];
  var lng = locGeom.coordinates[0];

  // Pan location
  var cardWidthPx = $('#card-layer').width();
  var mapWidthPx = $('body').width();
  var bgWidthPx = (mapWidthPx - cardWidthPx);
  var bgHeightPx = $('body').height();
  var bgXPx = Math.round(bgWidthPx / 2);
  // eslint-disable-next-line no-magic-numbers
  var bgYPx = Math.round(bgHeightPx / 2.1);

  var bgPx = new google.maps.Point(bgXPx, bgYPx);
  var bgLatLng = convert.point2LatLng(bgPx, map);

  var dLat = lat - bgLatLng.lat();
  var dLng = lng - bgLatLng.lng();

  var c = map.getCenter();

  var targetLatLng = new google.maps.LatLng(c.lat() + dLat, c.lng() + dLng);

  return targetLatLng;
};

module.exports = function (map) {

  var self = this;

  // When location page opens, map pans so that location becomes visible
  // on the background. After location page is closed, this pan is being
  // undone. We only need to remember the original map center.
  var _panUndoLatLng = null;

  // Public methods

  self.panForLocation = function (location) {
    // Pan map so that target location becomes centered on
    // the visible background.
    //
    // Parameters:
    //   location, where location.getGeom() is a
    //     GeoJSON Point

    // Wait until map has projection.
    // See convert.point2LatLng for details.
    var pev = 'projection_changed';
    if (!map.getProjection()) {
      google.maps.event.addListenerOnce(map, pev, function () {
        self.panForLocation(location);
      });
      return;
    }

    // Store current, original center for undo.
    _panUndoLatLng = map.getCenter();

    var targetLatLng = getPanTarget(location.getGeom(), map);
    map.panTo(targetLatLng);
  };

  self.panUndo = function () {
    // Undo the pan
    if (_panUndoLatLng) {
      map.panTo(_panUndoLatLng);
    }
  };
};
