const db = require('tresdb-db');
const lib = require('./lib');

module.exports = (params, callback) => {
  // Parameters:
  //   params:
  //     locationId
  //     locationName
  //     username
  //     newStatus
  //       string
  //     oldStatus
  //       string

  const newEvent = {
    type: 'location_status_changed',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      newStatus: params.newStatus,
      oldStatus: params.oldStatus,
    },
  };

  lib.insertAndEmit(newEvent, callback);
};
