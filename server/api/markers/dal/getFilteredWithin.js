var db = require('tresdb-db');
var boundsToPolygon = require('./boundsToPolygon');

module.exports = function (params, callback) {
  // Get grid-filtered markers within bounds.
  // In grid-filtering, we get all locations within bounds,
  // ordered by filteration in grid-cell-wise manner.
  //
  // Parameters:
  //   params
  //     east
  //       longitude
  //     north
  //       latitude
  //     south
  //       latitude
  //     west
  //       longitude
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

  // Build query for matching set of locations.
  var q = {
    geom: {
      $geoWithin: {
        $geometry: boundsToPolygon(params),
      },
    },
    deleted: false,
  };
  // Limit by type if specified
  if (params.type !== 'any') {
    q.type = params.type;
  }

  // Get the matching set of locations.
  coll.find(q).project(projOpts).toArray(callback);

  // Add them to the grid filter.

  // Get the basic set of locations.

  // Add them to the grid filter.

  // Return with grid-filter contents.
};
