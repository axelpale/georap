var request = require('../lib/request');

module.exports = function (params, callback) {
  // Fetch events of single location, most recent first.
  //
  // Parameters
  //   params
  //     locationId
  //     skip
  //       integer
  //     limit
  //       integer
  //   callback
  //     function (err, events, more) where
  //       events
  //         array of event objects
  //       more
  //         boolean. True if there are still more events after skip+limit.
  //

  // Default skip limit
  params = Object.assign({
    skip: 0,
    limit: 50,
  }, params);

  return request.getJSON({
    url: '/api/locations/' + params.locationId + '/events',
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
