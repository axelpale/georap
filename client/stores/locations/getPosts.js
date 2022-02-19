var request = require('../lib/request');

module.exports = function (params, callback) {
  // Fetch a set of posts of the location, most recent first.
  //
  // Parameters:
  //   params
  //     locationId
  //     skip
  //       integer
  //     limit
  //       integer
  //   callback
  //     function (err, { entries, more }) where
  //       entries
  //         array of entry objects
  //       more
  //         boolean. True if there are still more entries after skip+limit.
  //
  return request.getJSON({
    url: '/api/locations/' + params.locationId + '/posts',
    data: {
      skip: params.skip,
      limit: params.limit,
    },
  }, function (err, result) {
    if (err) {
      return callback(err);
    }

    return callback(null, result);
  });
};
