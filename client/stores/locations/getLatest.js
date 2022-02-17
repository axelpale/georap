var request = require('../lib/request');

module.exports = function (params, callback) {
  // Fetch recent locations from server and return an array of locations objs.
  // Will call back with error if not found.
  //
  // Parameters:
  //   params
  //     skip: skip first locations
  //     limit: number of locations to fetch
  //   callback
  //     function (err, locations)
  //

  return request.getJSON({
    url: '/api/locations/',
    data: { // url params
      skip: params.skip,
      limit: params.limit,
    },
  }, function (err, result) {
    if (err) {
      return callback(err);
    }

    // Result is { locations, locationCount }
    return callback(null, result);
  });
};
