var request = require('../lib/request');
var locationStatuses = georap.config.locationStatuses;

module.exports = function (id, newStatus, callback) {
  // Replaces the current status and saves to server.
  //
  // Parameters
  //   id
  //     location id
  //   newStatus
  //     string
  //   callback
  //     function (err)
  //

  // Validate to catch bugs.
  if (locationStatuses.indexOf(newStatus) < 0) {
    throw new Error('Invalid location status string: ' + newStatus);
  }

  return request.postJSON({
    url: '/api/locations/' + id + '/status',
    data: { status: newStatus },
  }, callback);
};
