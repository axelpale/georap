const db = require('georap-db');
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
  const timestamp = db.timestamp();

  const eventForSource = {
    type: 'location_entry_moved_out',
    user: params.username,
    time: timestamp,
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
      toLocationId: params.toLocationId,
      toLocationName: params.toLocationName,
    },
  };

  // Double event so that the move shows in the event history of
  // the both locations.
  const eventForTarget = {
    type: 'location_entry_moved_in',
    user: params.username,
    time: timestamp,
    locationId: params.toLocationId,
    locationName: params.toLocationName,
    data: {
      entryId: params.entryId,
      fromLocationId: params.locationId,
      fromLocationName: params.locationName,
    },
  };

  lib.insertAndEmitMany([eventForSource, eventForTarget], callback);
};
