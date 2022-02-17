var request = require('../lib/request');

module.exports = function (batchId, callback) {
  // Preview data from an imported file before creating locations.
  //
  return request.getJSON({
    url: '/api/locations/import/' + batchId,
  }, callback);
};
