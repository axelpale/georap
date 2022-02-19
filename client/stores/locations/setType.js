var request = require('../lib/request');
var locationTypes = georap.config.locationTypes;

module.exports = function (id, newType, callback) {
  // Replaces the current type and saves to server.
  //
  // Parameters
  //   id
  //     location id
  //   newType
  //     string
  //   callback
  //     function (err)

  // Validate to catch bugs.
  if (locationTypes.indexOf(newType) < 0) {
    throw new Error('Invalid location type string: ' + newType);
  }

  return request.postJSON({
    url: '/api/locations/' + id + '/type',
    data: { type: newType },
  }, callback);
};
