const db = require('georap-db');

module.exports = (params, callback) => {
  // Get recent events of single location.
  // Raw events. No completion.
  //
  // Parameters
  //   params
  //     locationId
  //       id
  //     skip
  //       skip over this many hits until result
  //     limit
  //       max number of events to return
  //   callback
  //     function (err, events)
  //
  db.collection('events').aggregate([
    {
      $match: {
        locationId: params.locationId,
      },
    },
    {
      $sort: {
        time: -1,
      },
    },
    {
      // MongoDB engine optimizes this extended limit with the sort
      $limit: params.skip + params.limit,
    },
    {
      // Skip sorted results
      $skip: params.skip,
    },
  ]).toArray((err, events) => {
    if (err) {
      return callback(err);
    }

    return callback(null, events);
  });
};
