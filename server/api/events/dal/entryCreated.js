const db = require('tresdb-db');
const lib = require('./lib');

module.exports = (params, callback) => {
  // Parameters:
  //   params:
  //     entry
  //       the new raw entry object with _id
  //     locationId
  //     locationName
  //     username
  //   callback
  //     function (err)
  //
  if (typeof params.entry._id !== 'object') {
    throw new Error('Invalid entry id type: ' + typeof params.entry._id);
  }

  const newEvent = {
    type: 'location_entry_created',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entry._id, // consistent with change and delete
      entry: params.entry,
    },
  };

  // Insert the basic version and emit an extended version
  // with complete attachments.
  const attachmentProps = ['data.entry.attachments'];
  lib.insertAndCompleteAndEmit(newEvent, attachmentProps, callback);
};
