const db = require('tresdb-db');
const lib = require('./lib');

module.exports = (params, callback) => {
  // Parameters:
  //   params:
  //     entryId
  //     locationId
  //     locationName
  //     username
  //   callback
  //     function (err)
  //
  const newEvent = {
    type: 'location_entry_removed',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
    },
  };

  lib.insertAndEmit(newEvent, callback);
};
