var db = require('../../services/db');
var io = require('../../services/io');

// Private methods

var emitOne = function (ev) {
  if (!ev.hasOwnProperty('_id')) {
    throw new Error('Event must have a _id before emitting');
  }

  io.get().emit(ev.type, ev);
};

var insertOne = function (ev, callback) {
  // Parameters:
  //   ev
  //     event object to insert
  //   callback
  //     function (err, eventId);
  var coll = db.get().collection('events');

  coll.insertOne(ev, function (err, result) {
    if (err) {
      return callback(err);
    }
    return callback(null, result.insertedId);
  });
};

var insertAndEmit = function (ev, callback) {
  // Parameters:
  //   ev
  //     event object to insert and emit after insertion. Ev is given a _id.
  //   callback
  //     function (err)
  //
  insertOne(ev, function (err, newId) {
    if (err) {
      return callback(err);
    }
    ev._id = newId;
    emitOne(ev);
    return callback(null);
  });
};


// Public methods

exports.createLocationCreated = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
  //       ObjectId, location id
  //     lat
  //     lng
  //       float
  //     username
  //       string
  //   callback
  //     function (err);

  var newEvent = {
    type: 'location_created',
    user: params.username,
    time: (new Date()).toISOString(),
    locationId: params.locationId,
    data: {
      lat: params.lat,
      lng: params.lng,
    },
  };

  insertAndEmit(newEvent, callback);
};

exports.createLocationRemoved = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
  //       ObjectId, location id
  //     locationName
  //       string
  //     username
  //       string
  //   callback
  //     function (err);

  var newEvent = {
    type: 'location_removed',
    user: params.username,
    time: (new Date()).toISOString(),
    locationId: params.locationId,
    data: {},
  };

  insertAndEmit(newEvent, callback);
};

exports.getRecent = function (n, page, callback) {
  // Parameters
  //   n
  //     number of events to return
  //   page
  //     page number. 0 = first page. Return range [n * page, n * (page + 1)[
  //     from the array of all events, ordered by time, most recent first
  //   callback
  //     function (err, events)

  var eventsColl = db.get().collection('events');
  //var locsColl = db.get().collection('locations');

  /*eventsColl.find({}).sort({ time: -1 }).toArray(function (err, docs) {
    if (err) {
      return callback(err);
    }

    return callback(null, docs);
  });*/

  eventsColl.aggregate([
    {
      $sort: {
        time: -1,
      },
    },
    {
      // Specify first document to return
      $skip: n * page,
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
  ], function (err, docs) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    return callback(null, docs);
  });
};
