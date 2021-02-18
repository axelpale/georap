//
// Events
//
const db = require('tresdb-db');

// Public methods

exports.createLocationEntryChanged = require('./entryChanged');
exports.createLocationEntryCreated = require('./entryCreated');
exports.createLocationEntryRemoved = require('./entryRemoved');
exports.createLocationEntryCommentCreated = require('./commentCreated');
exports.createLocationEntryCommentChanged = require('./commentChanged');
exports.createLocationEntryCommentRemoved = require('./commentRemoved');

exports.createLocationCreated = require('locationCreated');
exports.createLocationGeomChanged = require('locationGeomChanged');
exports.createLocationNameChanged = require('locationNameChanged');
exports.createLocationStatusChanged = require('locationStatusChanged');
exports.createLocationTypeChanged = require('locationTypeChanged');
exports.createLocationRemoved = require('locationRemoved');

exports.getAllOfUser = (username, callback) => {
  // Parameters
  //   username
  //     string
  //   callback
  //     function (err, events)

  const coll = db.collection('events');

  coll.find({ user: username }).toArray(callback);
};

exports.getAllOfLocation = (locationId, callback) => {
  // Parameters:
  //   locationId
  //   callback
  //     function (err, events)
  db.collection('events').find({ locationId: locationId }).toArray(callback);
};

exports.getRecent = (n, beforeTime, callback) => {
  // Parameters
  //   n
  //     number of events to return
  //   beforeTime
  //     time as ISOString
  //   callback
  //     function (err, events)
  return exports.getRecentFiltered({}, n, beforeTime, callback);
};

exports.getRecentOfUser = (username, n, beforeTime, callback) => {
  const filter = { user: username };
  return exports.getRecentFiltered(filter, n, beforeTime, callback);
};

exports.getRecentFiltered = (filter, n, beforeTime, callback) => {
  // Parameters
  //   filter
  //     the value of $match operator. See
  //     https://docs.mongodb.com/manual/reference/operator/aggregation/match/
  //     Use {} to filter nothing.
  //   n
  //     number of events to return
  //   beforeTime
  //     time as ISOString. Only events before this time are selected.
  //   callback
  //     function (err, events)
  //
  const eventsColl = db.get().collection('events');

  eventsColl.aggregate([
    {
      $match: filter,
    },
    {
      $sort: {
        time: -1,
      },
    },
    {
      // Filter out the events with time after or equal to beforeTime
      $match: {
        time: {
          $lt: beforeTime,
        },
      },
    },
    {
      // Specify last document to return
      $limit: n,
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
  ]).toArray((err, docs) => {
    if (err) {
      return callback(err);
    }
    return callback(null, docs);
  });
};
