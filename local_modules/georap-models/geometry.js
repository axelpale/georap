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

exports.boundsToZoom = function (bounds) {
  // Poor lad's bounds to zoom conversion.
  // Does not account for the mercator projection.
  // For more accurate match, use google.map.fitBounds
  //
  // Parameters:
  //   bounds
  //     LatLngBounds object
  //
  // Return
  //   integer, zoom level
  //

  // Adjusting parameters
  var zoomAdj = 1;

  // Deal with international date line
  // var dlng = ((bounds.east + 360) % 360) - ((bounds.west + 360) % 360)
  // var dlat = ((bounds.north + 180) % 180) - ((bounds.south + 180) % 180)
  // Or use toSpan()
  var span = bounds.toSpan()
  var dlat = span.lat()
  var dlng = span.lng()

  // Rough viewport diagonal length in degrees
  var diag = Math.sqrt(dlng * dlng + dlat * dlat)

  // Each increasing zoom level the viewport dimensions halves
  // Assume full world view 360° at zoom=0
  //     diag = 360 / 2**zoom
  // <=> 2**zoom = 360 / diag
  // <=> zoom = log2(360 / diag)
  var zoom = Math.log2(360 / diag) + zoomAdj

  return Math.round(zoom)
}
