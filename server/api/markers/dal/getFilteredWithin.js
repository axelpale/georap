var db = require('tresdb-db');
var DistFilter = require('distfilter');
var boundsToPolygon = require('./boundsToPolygon');

module.exports = function (params, callback) {
  // Get grid-filtered markers within bounds.
  // In grid-filtering, we get all locations within bounds,
  // ordered by filteration in grid-cell-wise manner.
  //
  // Parameters:
  //   params
  //     bounds, an object with props
  //       east
  //         longitude
  //       north
  //         latitude
  //       south
  //         latitude
  //       west
  //         longitude
  //     groupRadius
  //       number in geo degrees
  //       Group markers within this radius.
  //     status (FUTURE)
  //       a string.
  //       Prioritize locations having this status.
  //     type
  //       a string
  //       Prioritize locations having this type.
  //     marking (FUTURE)
  //       a string
  //       Prioritize locations that the user has marked as this.
  //       Example values: 'visited', 'created'
  //   callback
  //     function (err, markers)
  //
  // Where markers has structure similar to:
  //   [
  //     {
  //       _id: <ObjectId>,
  //       name: <string>,
  //       geom: <GeoJSON Point>,
  //       status: <string>,
  //       type: <string>,
  //       layer: <integer>,
  //       childLayer: <integer>,
  //       // Possible future properties
  //       match: <bool>, true if filter matched
  //       hid: <int>, the number of hidden markers under it
  //       hidMatched: <int>, a number of matches in those hidden markers.
  //     },
  //     ...
  //   ]
  //

  var coll = db.collection('locations');

  // Only these props are needed for markers.
  var projOpts = {
    name: true,
    geom: true,
    status: true,
    type: true,
    layer: true,
    childLayer: true,
  };

  // Sort by points to enforce deterministic grid insertion order.
  var sortOpts = {
    points: -1,
    name: 1, // Often points identical.
  };

  // Build query for matching set of locations.
  var q = {
    geom: {
      $geoWithin: {
        $geometry: boundsToPolygon(params.bounds),
      },
    },
    deleted: false,
  };
  // Limit by type if specified
  if (params.type !== 'any') {
    q.type = params.type;
  }

  // Get the matching set of locations.
  coll.find(q)
    .sort(sortOpts)
    .project(projOpts)
    .toArray(function (err, markers) {
      if (err) {
        return callback(err);
      }

      // Add matched to the dist filter.
      var df = new DistFilter(params.groupRadius);
      markers.forEach(function (m) {
        df.add(m);
      });

      // Return with filtered contents.
      var filteredMarkers = df.getMarkers();
      return callback(null, filteredMarkers);
    });
};
