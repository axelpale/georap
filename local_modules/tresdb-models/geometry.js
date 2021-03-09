exports.latLngToPoint = function (latLng) {
  // LatLngLiteral to GeoJSON point
  return {
    type: 'Point',
    coordinates: [latLng.lng, latLng.lat]
  }
}

exports.pointToLatLng = function (geom) {
  return {
    lat: geom.coordinates[1],
    lng: geom.coordinates[0]
  }
}
