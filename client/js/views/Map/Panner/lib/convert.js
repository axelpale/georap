/* global google */

exports.latLng2Point = function (latLng, map) {
  var topRight = map.getProjection()
    .fromLatLngToPoint(map.getBounds().getNorthEast());
  var bottomLeft = map.getProjection()
    .fromLatLngToPoint(map.getBounds().getSouthWest());
  var scale = Math.pow(2, map.getZoom());
  var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
  return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale,
                               (worldPoint.y - topRight.y) * scale);
};

exports.point2LatLng = function point2LatLng(point, map) {
  var topRight = map.getProjection()
    .fromLatLngToPoint(map.getBounds().getNorthEast());
  var bottomLeft = map.getProjection()
    .fromLatLngToPoint(map.getBounds().getSouthWest());
  var scale = Math.pow(2, map.getZoom());
  var worldPoint = new google.maps.Point((point.x / scale) + bottomLeft.x,
                                         (point.y / scale) + topRight.y);
  return map.getProjection().fromPointToLatLng(worldPoint);
};
