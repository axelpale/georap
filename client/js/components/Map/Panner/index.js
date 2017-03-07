/* global google */

var convert = require('./lib/convert');

module.exports = function (map) {

  var self = this;

  // When location page opens, map pans so that location becomes visible
  // on the background. After location page is closed, this pan is being
  // undone. We only need to remember the original map center.
  var _panForCardUndoLatLng = null;

  // Public methods

  self.panForCard = function (geom) {
    // Pan map so that target location becomes centered on
    // the visible background.
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
    _panForCardUndoLatLng = map.getCenter();

    var lat = geom.coordinates[1];
    var lng = geom.coordinates[0];

    var cardWidthPx = $('#card-container').width();
    var mapWidthPx = $('body').width();
    var bgWidthPx = (mapWidthPx - cardWidthPx);
    var bgHeightPx = $('body').height();
    var bgXPx = Math.round(bgWidthPx / 2);
    var bgYPx = Math.round(bgHeightPx / 2);

    var bgPx = new google.maps.Point(bgXPx, bgYPx);
    var bgLatLng = convert.point2LatLng(bgPx, map);

    var dLat = lat - bgLatLng.lat();
    var dLng = lng - bgLatLng.lng();

    var c = map.getCenter();

    var targetLatLng = new google.maps.LatLng(c.lat() + dLat, c.lng() + dLng);
    map.panTo(targetLatLng);
  };

  self.panForCardUndo = function () {
    // Undo the pan made by panForCard
    if (_panForCardUndoLatLng) {
      map.panTo(_panForCardUndoLatLng);
    }
  };
};
