const db = require('tresdb-db');
const lib = require('./lib');

module.exports = (params, callback) => {
  // Parameters:
  //   params:
  //     entryId
  //     locationId
  //     locationName
  //     username
  //     toLocationId
  //     toLocationName
  //   callback
  //     function (err)
  //
  const newEvent = {
    type: 'location_entry_moved',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
      toLocationId: params.toLocationId,
      toLocationName: params.toLocationName,
    },
  };

  lib.insertAndEmit(newEvent, callback);
};
