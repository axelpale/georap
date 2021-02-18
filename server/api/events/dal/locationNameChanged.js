const db = require('tresdb-db');
const lib = require('./lib');

module.exports = (params, callback) => {
  // Parameters:
  //   params:
  //     locationId
  //     locationName
  //     username
  //     newName
  //       string
  //     oldName
  //       string

  const newEvent = {
    type: 'location_name_changed',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      newName: params.newName,
      oldName: params.oldName,
    },
  };

  lib.insertAndEmit(newEvent, callback);
};
