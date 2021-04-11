const db = require('tresdb-db');
const lib = require('./lib');

module.exports = (params, callback) => {
  // Parameters:
  //   params:
  //     username
  //     locationId
  //     locationName
  //     entryId
  //     commentId
  //     original
  //       original values of changed props
  //     delta
  //       new values of changed props
  //   callback
  //     function (err)
  //
  // Precondition:
  //   original and delta are minimal
  //
  let filled = false; // Prevent empty changes

  if ('markdown' in params.original && 'markdown' in params.delta &&
      params.original.markdown !== params.delta.markdown) {
    filled = true;
  }
  if ('attachments' in params.original && 'attachments' in params.delta &&
      params.original.attachments !== params.delta.attachments) {
    filled = true;
  }

  if (!filled) {
    // No need to emit anything.
    // It is okay for user to save the same message, so no error.
    return callback();
  }

  const newEvent = {
    type: 'location_entry_comment_changed',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
      commentId: params.commentId,
      original: params.original,
      delta: params.delta,
    },
  };

  // Insert the basic version and emit an extended version
  // with complete attachments (if needed).
  const attachmentProps = [
    'data.original.attachments',
    'data.delta.attachments',
  ];
  lib.insertAndCompleteAndEmit(newEvent, attachmentProps, callback);
};
