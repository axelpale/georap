/* global google */

module.exports = function (bounds) {
  // A google.maps.LatLngBounds diagonal distance in meters.

  // Geometry library is required.
  // See http://stackoverflow.com/a/4874741
  var geo = google.maps.geometry.spherical;

  // Corners
  var ne = bounds.getNorthEast();
  var sw = bounds.getSouthWest();

  // Meters between corners
  var diagonal = geo.computeDistanceBetween(ne, sw);

  return diagonal;
};
