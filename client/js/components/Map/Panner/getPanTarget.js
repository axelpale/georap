/* global google */
var getVisibleCenter = require('../lib/getVisibleCenter');

module.exports = function (latLng, map) {

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
