//
// Events
//
const db = require('tresdb-db');
const urls = require('georap-urls-server');
const attachmentUrls = require('../../attachments/attachment/urls');

// Public methods

exports.createLocationEntryChanged = require('./entryChanged');
exports.createLocationEntryCreated = require('./entryCreated');
exports.createLocationEntryRemoved = require('./entryRemoved');
exports.createLocationEntryCommentCreated = require('./commentCreated');
exports.createLocationEntryCommentChanged = require('./commentChanged');
exports.createLocationEntryCommentRemoved = require('./commentRemoved');

exports.createLocationCreated = require('./locationCreated');
exports.createLocationGeomChanged = require('./locationGeomChanged');
exports.createLocationNameChanged = require('./locationNameChanged');
exports.createLocationStatusChanged = require('./locationStatusChanged');
exports.createLocationTypeChanged = require('./locationTypeChanged');
exports.createLocationRemoved = require('./locationRemoved');

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

  db.collection('events').find(q, opt).toArray(function (err, evs) {
    if (err) {
      return callback(err);
    }

    return callback(null, evs);
  });
};

exports.getRecentComplete = (params, callback) => {
  // Get recent location events, urls completed.
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
  ]).toArray((err, events) => {
    if (err) {
      return callback(err);
    }

    // Complete location thumbnail urls
    events.forEach((ev) => {
      if (ev.location.thumb) {
        ev.location.thumburl = attachmentUrls.completeToUrl(ev.location.thumb);
      } else {
        ev.location.thumburl = urls.locationTypeToSymbolUrl(ev.location.type);
      }
      delete ev.location.thumb;
    });

    return callback(null, events);
  });
};

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
