var geomDist2 = function (g1, g2) {
  // Parameters:
  //   g1, g2
  //     GeoJSON Points with lng lat coordinates.
  const lng1 = g1.coordinates[0]
  const lat1 = g1.coordinates[1]
  const lng2 = g2.coordinates[0]
  const lat2 = g2.coordinates[1]
  return (lng1 - lng2) * (lng1 - lng2) + (lat1 - lat2) * (lat1 - lat2)
}

const DistFilter = function (radius) {
  // Parameters:
  //   radius
  //     number, radius of area to keep clear around marker.

  // Store radius^2. Filter out markers that are closer than this
  // to the already added markers.
  this.r2 = radius * radius

  // Maintain a list of added markers.
  this.added = []
}

const proto = DistFilter.prototype

module.exports = DistFilter

proto.add = function (marker) {
  // Go through added markers, find one with min distance.
  // If distance less than specified, increase childCount.
  // Else add.
  let minDist = this.r2
  let minParent = null
  let i, d2
  for (i = 0; i < this.added.length; i += 1) {
    d2 = geomDist2(this.added[i].geom, marker.geom)
    if (d2 < minDist) {
      minDist = d2
      minParent = this.added[i]
    }
  }

  if (minParent === null) {
    // Add new marker
    marker.childCount = 0
    this.added.push(marker)
  } else {
    // The neighbor is too close. Ignore the marker and top the parent.
    minParent.childCount += 1
  }
}

proto.getMarkers = function () {
  // List of filtered markers
  return this.added
}
