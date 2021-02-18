/* eslint-disable max-lines */
//
// Location events
//
var db = require('tresdb-db');
var proj = require('../../../services/proj');
const lib = require('./lib');

// Public methods

exports.createLocationCreated = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
  //       ObjectId, location id
  //     locationName
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
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      lat: params.lat,
      lng: params.lng,
    },
  };

  lib.insertAndEmit(newEvent, callback);
};

exports.createLocationEntryChanged = require('./createLocationEntryChanged');
exports.createLocationEntryCreated = require('./createLocationEntryCreated');
exports.createLocationEntryRemoved = require('./createLocationEntryRemoved');

exports.createLocationEntryCommentCreated = (params, callback) => {
  // Parameters:
  //   params:
  //     locationId
  //     locationName
  //     entryId
  //     comment
  //       new comment object
  //   callback
  //     function (err)
  //
  const newEvent = {
    type: 'location_entry_comment_created',
    user: params.comment.user,
    time: params.comment.time,
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
      commentId: params.comment.id,
      comment: params.comment,
    },
  };

  lib.insertAndEmit(newEvent, callback);
};

exports.createLocationEntryCommentChanged = (params, callback) => {
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

  lib.insertAndEmit(newEvent, callback);
};

exports.createLocationEntryCommentRemoved = (params, callback) => {
  // Parameters:
  //   params:
  //     username
  //     locationId
  //     locationName
  //     entryId
  //     commentId
  //     commentUsername
  //   callback
  //     function (err)

  const newEvent = {
    type: 'location_entry_comment_removed',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
      commentId: params.commentId,
    },
  };

  lib.insertAndEmit(newEvent, callback);
};

exports.createLocationGeomChanged = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
  //     locationName
  //     username
  //     newGeom
  //       GeoJSON Point
  //     oldGeom
  //       GeoJSON Point

  var newEvent = {
    type: 'location_geom_changed',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      newGeom: params.newGeom,
      oldGeom: params.oldGeom,
    },
  };

  // Insert the basic version and emit an extended version with alt coords.
  // The alt coords are needed in client.
  lib.insertOne(newEvent, function (err, newId) {
    if (err) {
      return callback(err);
    }
    newEvent._id = newId;
    // Compute additional coodinate systems
    var newAltGeom = proj.getAltPositions(params.newGeom.coordinates);
    newEvent.data.newAltGeom = newAltGeom;
    // Emit the extended version.
    lib.emitOne(newEvent);
    return callback(null);
  });
};

exports.createLocationNameChanged = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
  //     locationName
  //     username
  //     newName
  //       string
  //     oldName
  //       string

  var newEvent = {
    type: 'location_name_changed',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      newName: params.newName,
      oldName: params.oldName,
    },
  };

  lib.insertAndEmit(newEvent, callback);
};

exports.createLocationStatusChanged = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
  //     locationName
  //     username
  //     newStatus
  //       string
  //     oldStatus
  //       string

  var newEvent = {
    type: 'location_status_changed',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      newStatus: params.newStatus,
      oldStatus: params.oldStatus,
    },
  };

  lib.insertAndEmit(newEvent, callback);
};

exports.createLocationTypeChanged = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
  //     locationName
  //     username
  //     newType
  //       string
  //     oldType
  //       string

  var newEvent = {
    type: 'location_type_changed',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      newType: params.newType,
      oldType: params.oldType,
    },
  };

  lib.insertAndEmit(newEvent, callback);
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
    locationName: params.locationName,
    data: {},
  };

  lib.insertAndEmit(newEvent, callback);
};

exports.getAllOfUser = function (username, callback) {
  // Parameters
  //   username
  //     string
  //   callback
  //     function (err, events)

  var coll = db.collection('events');

  coll.find({ user: username }).toArray(callback);
};

exports.getAllOfLocation = function (locationId, callback) {
  // Parameters:
  //   locationId
  //   callback
  //     function (err, events)
  db.collection('events').find({ locationId: locationId }).toArray(callback);
};

exports.getRecent = function (n, beforeTime, callback) {
  // Parameters
  //   n
  //     number of events to return
  //   beforeTime
  //     time as ISOString
  //   callback
  //     function (err, events)
  return exports.getRecentFiltered({}, n, beforeTime, callback);
};

exports.getRecentOfUser = function (username, n, beforeTime, callback) {
  var filter = { user: username };
  return exports.getRecentFiltered(filter, n, beforeTime, callback);
};

exports.getRecentFiltered = function (filter, n, beforeTime, callback) {
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

  var eventsColl = db.get().collection('events');

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
  ]).toArray(function (err, docs) {
    if (err) {
      return callback(err);
    }
    return callback(null, docs);
  });
};
