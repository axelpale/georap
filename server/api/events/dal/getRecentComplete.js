const db = require('georap-db');
const urls = require('georap-urls-server');

module.exports = (params, callback) => {
  // Get recent location events, location thumbnail completed.
  //
  // Parameters
  //   params
  //     skip
  //       skip over this many hits until result
  //     limit
  //       max number of events to return
  //   callback
  //     function (err, events)
  //
  db.collection('events').aggregate([
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
    {
      // Join with location data
      $lookup: {
        from: 'locations',
        localField: 'locationId',
        foreignField: '_id',
        as: 'location',
      },
    },
    {
      // Change the location array to the single location (the first item).
      $unwind: '$location',
    },
    {
      // Find location thumbnail attachments
      $lookup: {
        from: 'attachments',
        localField: 'location.thumbnail',
        foreignField: 'key',
        as: 'location.thumbnail',
      },
    },
    {
      // Change the location array to the single location (the first item).
      $unwind: {
        path: '$location.thumbnail',
        preserveNullAndEmptyArrays: true, // Keep event even if no loc thumb
      },
    },
  ]).toArray((err, events) => {
    if (err) {
      return callback(err);
    }

    // Complete location thumbnail urls
    events.forEach((ev) => {
      if (ev.location.thumbnail) {
        ev.location.thumbnail = urls.completeAttachment(ev.location.thumbnail);
      }
    });

    return callback(null, events);
  });
};
