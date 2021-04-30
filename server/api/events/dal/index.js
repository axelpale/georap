//
// Events
//
const db = require('georap-db');

// Statistics

exports.count = (callback) => {
  // Count events
  //
  // Parameters:
  //   callback
  //     function (err, number)
  //
  db.collection('events')
    .countDocuments({})
    .then((number) => {
      return callback(null, number);
    })
    .catch((err) => {
      return callback(err);
    });
};

// Event creation

exports.createLocationEntryChanged = require('./entryChanged');
exports.createLocationEntryCreated = require('./entryCreated');
exports.createLocationEntryMoved = require('./entryMoved');
exports.createLocationEntryRemoved = require('./entryRemoved');
exports.createLocationEntryCommentCreated = require('./commentCreated');
exports.createLocationEntryCommentChanged = require('./commentChanged');
exports.createLocationEntryCommentRemoved = require('./commentRemoved');

exports.createLocationCreated = require('./locationCreated');
exports.createLocationGeomChanged = require('./locationGeomChanged');
exports.createLocationNameChanged = require('./locationNameChanged');
exports.createLocationStatusChanged = require('./locationStatusChanged');
exports.createLocationTypeChanged = require('./locationTypeChanged');
exports.createLocationThumbnailChanged = require('./locationThumbnailChanged');
exports.createLocationRemoved = require('./locationRemoved');

// Event retrieval

exports.getAllOfUser = (username, callback) => {
  // WARNING possibly computationally heavy if lots of events
  //
  // Parameters
  //   username
  //     string
  //   callback
  //     function (err, events)
  //
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

exports.getAllOfLocationComplete = (locationId, callback) => {
  // Get all events of the location, most recent first.
  // TODO Expand possible attachments and their URLs.
  //
  const q = { locationId: locationId };
  const opt = { sort: { time: -1 } };

  db.collection('events').find(q, opt).toArray((err, evs) => {
    if (err) {
      return callback(err);
    }

    return callback(null, evs);
  });
};

exports.getRecentComplete = require('./getRecentComplete');

exports.getRecentOfUser = (username, n, beforeTime, callback) => {
  const filter = { user: username };
  return exports.getRecentFiltered(filter, n, beforeTime, callback);
};

exports.getRecentFiltered = (filter, limit, beforeTime, callback) => {
  // Parameters
  //   filter
  //     the value of $match operator. See
  //     https://docs.mongodb.com/manual/reference/operator/aggregation/match/
  //     Use {} to filter nothing.
  //   limit
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
      $limit: limit,
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
