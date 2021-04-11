const db = require('tresdb-db');
const lib = require('./lib');

module.exports = (params, callback) => {
  // Notify about changed entry
  //
  // Parameters:
  //   params:
  //     entryId
  //       string
  //     locationId
  //       string
  //     locationName
  //       string
  //     username
  //       string
  //     delta
  //       object of changed values
  //     original
  //       object of original values
  //
  if (typeof params.entryId !== 'object') {
    throw new Error('Invalid entry id type: ' + typeof params.entryId);
  }

  const newEvent = {
    type: 'location_entry_changed',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
      original: params.original,
      delta: params.delta,
    },
  };

  // Insert the basic version and emit an extended version
  // with complete attachments (if any).
  const attachmentProps = [
    'data.original.attachments',
    'data.delta.attachments',
  ];
  lib.insertAndCompleteAndEmit(newEvent, attachmentProps, callback);
};
