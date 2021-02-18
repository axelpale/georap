const db = require('tresdb-db');
const lib = require('./lib');

module.exports = (params, callback) => {
  // Parameters:
  //   params:
  //     entryId
  //       string
  //     locationId
  //       string
  //     locationName
  //       string
  //     delta
  //       object of changed values
  //     original
  //       object of original values

  if (typeof params.oldEntry._id !== 'object') {
    throw new Error('Invalid entry id type: ' + typeof params.oldEntry._id);
  }

  const newEvent = {
    type: 'location_entry_changed',
    user: params.oldEntry.user,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.oldEntry._id,
      original: params.original,
      delta: params.delta,
    },
  };

  lib.insertAndEmit(newEvent, callback);
};
