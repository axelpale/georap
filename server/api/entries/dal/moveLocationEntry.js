const db = require('georap-db');
const eventsDal = require('../../events/dal');

module.exports = function (params, callback) {
  // Move entry to another location.
  //
  // Parameters:
  //   params
  //     locationId
  //     locationName
  //     username
  //     entryId
  //     toLocationId
  //   callback
  //     function (err)
  //

  // Ensure target location exists and is not deleted
  db.collection('locations')
    .findOne({
      _id: params.toLocationId,
      deleted: false,
    }, (err, targetLoc) => {
      if (err) {
        return callback(err);
      }

      if (!targetLoc) {
        const errn = new Error('Location not found.');
        errn.name = 'NOT_FOUND';
        return callback(errn);
      }

      const q = { _id: params.entryId };
      const u = {
        $set: {
          locationId: targetLoc._id,
        },
      };

      db.collection('entries')
        .updateOne(q, u, (erru) => {
          if (erru) {
            return callback(erru);
          }

          const eventParams = {
            username: params.username,
            entryId: params.entryId,
            locationId: params.locationId,
            locationName: params.locationName,
            toLocationId: targetLoc._id,
            toLocationName: targetLoc.name,
          };

          eventsDal.createLocationEntryMoved(eventParams, callback);
        });
    });
};
