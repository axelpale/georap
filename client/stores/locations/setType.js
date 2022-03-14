var request = require('../lib/request');
var locationStatuses = georap.config.locationStatuses;
var locationTypes = georap.config.locationTypes;

module.exports = function (id, newStatus, newType, callback) {
  // Replaces the current status and saves to server.
  //
  // Parameters
  //   id
  //     location id
  //   newStatus
  //     string
  //   newType
  //     string
  //   callback
  //     function (err)
  //

  // Validate to catch bugs.
  if (locationStatuses.indexOf(newStatus) < 0) {
    throw new Error('Invalid location status string: ' + newStatus);
  }
  if (locationTypes.indexOf(newType) < 0) {
    throw new Error('Invalid location type string: ' + newType);
  }

  return request.postJSON({
    url: '/api/locations/' + id + '/type',
    data: {
      status: newStatus,
      type: newType,
    },
  }, callback);
};
