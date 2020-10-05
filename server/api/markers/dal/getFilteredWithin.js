// var db = require('../../../services/db');

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
  //     color
  //       an array of strings. Default is [].
  //       Prioritize locations having this color.
  //     symbol
  //       an array of strings. Default is [].
  //       Prioritize locations that have this symbols.
  //     marking
  //       an array of strings. Default is [].
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

  // Get the matching set of locations.

  // Add them to the grid filter.

  // Get the basic set of locations.

  // Add them to the grid filter.

  // Return with grid-filter contents.

  return callback(new Error('Not implemented'));
};
