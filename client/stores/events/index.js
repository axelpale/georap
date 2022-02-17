// Event API
//
const request = require('../lib/request');

exports.getRecent = function (params, callback) {
  // Get recent events.
  //
  // Parameters:
  //   params
  //     skip
  //       integer, how many to skip before results. Default 0.
  //     limit
  //       integer, how many to include into the results. Default 50.
  //   callback
  //     function (err, events)
  //       Parameters:
  //         err
  //         events
  //           array, most recent event first
  //
  params = Object.assign({
    skip: 0,
    limit: 50,
  }, params);

  request.getJSON({
    url: '/api/events',
    data: {
      skip: params.skip,
      limit: params.limit,
    },
  }, callback);
};
