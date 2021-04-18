const db = require('tresdb-db');
const eventsDal = require('../../events/dal');

module.exports = (params, callback) => {
  // Mark entry as deleted. The worker or a migration step
  // will remove deleted entries and their attachments at some point.
  //
  // Parameters:
  //   params
  //     entryId
  //     locationId
  //     locationName
  //     username
  //     entry
  //       entry object
  //   callback
  //     function (err)
  //

  const q = { _id: params.entryId };
  const u = {
    $set: {
      deleted: true,
    },
  };

  db.collection('entries').updateOne(q, u, (err) => {
    if (err) {
      return callback(err);
    }
    eventsDal.createLocationEntryRemoved(params, callback);
  });
};
