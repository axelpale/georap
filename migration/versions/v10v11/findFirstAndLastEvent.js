const db = require('georap-db');

module.exports = function (username, callback) {
  // Find earliest and latest event of an user.
  // Do not count location_unproven_visit_created events
  // because their dates were taken from location creation dates.
  //
  // Parameters:
  //   username
  //     string
  //   callback
  //     function (err, obj), where obj has props:
  //       first
  //         the earliest event
  //       last
  //         the latest event
  //
  const evs = db.collection('events');
  const query = {
    user: username,
    type: {
      $ne: 'location_unproved_visit_created',
    },
  };

  evs
    .find(query)
    .sort({ time: 1 })
    .limit(1)
    .toArray((erre, earliestEvs) => {
      if (erre) {
        return callback(erre);
      }

      evs
        .find(query)
        .sort({ time: -1 })
        .limit(1)
        .toArray((errl, latestEvs) => {
          if (errl) {
            return callback(errl);
          }

          if (latestEvs.length > 0) {
            // Success
            return callback(null, {
              first: earliestEvs[0],
              last: latestEvs[0],
            });
          } // else

          // No events. Use nulls.
          return callback(null, {
            first: null,
            last: null,
          });
        });
    });
};
