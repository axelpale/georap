var request = require('../lib/request');

module.exports = function (params, callback) {
  // Search for non-deleted locations
  return request.getJSON({
    url: '/api/locations/search',
    data: {
      phrase: params.phrase,
      skip: params.skip,
      limit: params.limit,
    },
  }, callback);
};
