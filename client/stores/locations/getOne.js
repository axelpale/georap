var request = require('../lib/request');

module.exports = function (id, callback) {
  // Fetch a location from server and return a location object.
  // Will call back with error if not found.
  //
  // Parameters:
  //   id
  //     ID string
  //   callback
  //     function (err, location)
  //
  return request.getJSON({
    url: '/api/locations/' + id,
  }, callback);
};
