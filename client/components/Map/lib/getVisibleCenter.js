/* global google */
var convert = require('./convert');

module.exports = function (map) {
  // Compute center of the visible portion in pixels
  var cardWidthPx = $('#card-layer').width();
  var mapWidthPx = $('body').width();
  var bgWidthPx = (mapWidthPx - cardWidthPx);
  var bgHeightPx = $('body').height();
  var bgXPx = Math.round(bgWidthPx / 2);
  var bgYPx = Math.round(bgHeightPx / 2.1);

  // Convert the pixel position into coordinates
  var bgPx = new google.maps.Point(bgXPx, bgYPx);
  var bgLatLng = convert.point2LatLng(bgPx, map);

  return {
    lat: bgLatLng.lat(),
    lng: bgLatLng.lng(),
  };
};
