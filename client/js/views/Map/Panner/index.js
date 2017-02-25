/* global google */

var convert = require('./lib/convert');

module.exports = function (map) {

  // When location page opens, map pans so that location becomes visible
  // on the background. After location page is closed, this pan is being
  // undone. We only need to remember the original map center.
  var _panForCardUndoLatLng = null;

  // Public methods

  this.panForCard = function (lat, lng) {
    // Pan map so that target location becomes centered on
    // the visible background.
    //
    // Parameters:
    //   latlng
    //     Coords of the location

    // Store current, original center for undo.
    _panForCardUndoLatLng = map.getCenter();

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

  this.panForCardUndo = function () {
    // Undo the pan made by panForCard
    if (_panForCardUndoLatLng) {
      map.panTo(_panForCardUndoLatLng);
    }
  };
};
