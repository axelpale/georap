var request = require('../lib/request');

module.exports = function (batchId, callback) {
  // Get data about how import worked out.
  // After the user accepts the imported data and runs the import batch,
  // an outcome data is stored for user to inspect.
  return request.getJSON({
    url: '/api/locations/import/' + batchId + '/outcome',
  }, callback);
};
