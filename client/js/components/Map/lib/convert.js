/* global google */

exports.latLng2Point = function (latLng, map) {
  // Latitude and longitude to screen pixel coordinate.
  // Precondition: See note in point2LatLng
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
  // X Y screen pixel coordinate to latlng.
  // Precondition:
  //   getProjection returns undefined if map is not fully initialized.
  //  You must ensure map emits 'projection_changed' before accessing.
  var topRight = map.getProjection()
    .fromLatLngToPoint(map.getBounds().getNorthEast());
  var bottomLeft = map.getProjection()
    .fromLatLngToPoint(map.getBounds().getSouthWest());
  var scale = Math.pow(2, map.getZoom());
  var worldPoint = new google.maps.Point((point.x / scale) + bottomLeft.x,
                                         (point.y / scale) + topRight.y);
  return map.getProjection().fromPointToLatLng(worldPoint);
};
