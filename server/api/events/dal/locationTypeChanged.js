const db = require('georap-db');
const lib = require('./lib');

module.exports = (params, callback) => {
  // Parameters:
  //   params:
  //     locationId
  //     locationName
  //     username
  //     newType
  //       string
  //     oldType
  //       string

  const newEvent = {
    type: 'location_type_changed',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      newType: params.newType,
      oldType: params.oldType,
    },
  };

  lib.insertAndEmit(newEvent, callback);
};
