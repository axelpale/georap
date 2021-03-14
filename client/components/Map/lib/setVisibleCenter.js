/* global google */
var getVisibleCenter = require('./getVisibleCenter');

module.exports = function (latLng, map) {
  // Parameters:
  //   latLng
  //     LatLngLiteral, the point which should be at the center
  //       of the visible portion of the map.
  //   map
  //     google.maps.Map
  //
  // Return:
  //   LatLngLiteral, the point where the map should be panned
  //     to move the given latLng at the center of the visible portion.
  //

  var bgLatLng = getVisibleCenter(map);
  var lat = latLng.lat;
  var lng = latLng.lng;
  var dLat = lat - bgLatLng.lat;
  var dLng = lng - bgLatLng.lng;

  var c = map.getCenter();

  var targetLatLng = new google.maps.LatLng(c.lat() + dLat, c.lng() + dLng);

  return {
    lat: targetLatLng.lat(),
    lng: targetLatLng.lng(),
  };
};
