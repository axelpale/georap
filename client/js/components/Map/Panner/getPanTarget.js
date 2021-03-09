/* global google */
var getVisibleCenter = require('../lib/getVisibleCenter');

module.exports = function (geom, map) {

  var bgLatLng = getVisibleCenter(map);
  var lat = geom.coordinates[1];
  var lng = geom.coordinates[0];
  var dLat = lat - bgLatLng.lat;
  var dLng = lng - bgLatLng.lng;

  var c = map.getCenter();

  var targetLatLng = new google.maps.LatLng(c.lat() + dLat, c.lng() + dLng);

  return targetLatLng;
};
