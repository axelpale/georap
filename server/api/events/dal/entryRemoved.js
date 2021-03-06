const db = require('georap-db');
const lib = require('./lib');

module.exports = (params, callback) => {
  // Parameters:
  //   params:
  //     entryId
  //     locationId
  //     locationName
  //     username
  //     entry
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
      entry: params.entry,
    },
  };

  lib.insertAndEmit(newEvent, callback);
};
