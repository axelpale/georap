var request = require('../lib/request');

module.exports = function (id, callback) {
  // Delete a location
  //
  // Parameters
  //   id
  //   callback
  //     function (err)
  //
  return request.deleteJSON({
    url: '/api/locations/' + id,
    data: {},
  }, callback);
};
