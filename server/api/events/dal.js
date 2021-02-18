/* eslint-disable max-lines */
//
// Location events
//

var db = require('tresdb-db');
var io = require('../../services/io');
var proj = require('../../services/proj');

// Private methods

var emitOne = function (ev) {
  if (!('_id' in ev)) {
    throw new Error('Event must have a _id before emitting');
  }

  io.get().emit('tresdb_event', ev);
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

  insertAndEmit(newEvent, callback);
};

exports.createLocationEntryChanged = (params, callback) => {
  // Parameters:
  //   params:
  //     entryId
  //       string
  //     locationId
  //       string
  //     locationName
  //       string
  //     delta
  //       object of changed values
  //     original
  //       object of original values

  if (typeof params.oldEntry._id !== 'object') {
    throw new Error('Invalid entry id type: ' + typeof params.oldEntry._id);
  }

  const newEvent = {
    type: 'location_entry_changed',
    user: params.oldEntry.user,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.oldEntry._id,
      original: params.original,
      delta: params.delta,
    },
  };

  insertAndEmit(newEvent, callback);
};

exports.createLocationEntryCreated = (params, callback) => {
  // Parameters:
  //   params:
  //     entry
  //       the new raw entry object with _id
  //     locationId
  //     locationName
  //     username
  //   callback
  //     function (err)
  //
  if (typeof params.entry._id !== 'object') {
    throw new Error('Invalid entry id type: ' + typeof params.entry._id);
  }

  const newEvent = {
    type: 'location_entry_created',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entry._id, // consistent with change and delete
      entry: params.entry,
    },
  };

  // Insert the basic version and emit an extended version
  // with complete attachments.
  insertOne(newEvent, (err, newId) => {
    if (err) {
      return callback(err);
    }

    // Clone and fill id
    const eventForEmit = Object.assign({}, newEvent, {
      _id: newId,
    }):

    // Convert attachment keys to attachments.
    // This prevents additional requests from clients.
    attachmentsDal.getMany(params.entry.attachments, (merr, completeAtts) => {
      if (merr) {
        return callback(merr);
      }

      eventForEmit.data.entry.attachments = completeAtts;

      // Emit the extended version.
      emitOne(eventForEmit);

      return callback();
    });
  });
};

exports.createLocationEntryRemoved = (params, callback) => {
  // Parameters:
  //   params:
  //     entryId
  //     locationId
  //     locationName
  //     username
  //   callback
  //     function (err)
  //
  const newEvent = {
    type: 'location_entry_removed',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
    },
  };

  insertAndEmit(newEvent, callback);
};

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

  insertAndEmit(newEvent, callback);
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

  insertAndEmit(newEvent, callback);
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

  insertAndEmit(newEvent, callback);
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
  insertOne(newEvent, function (err, newId) {
    if (err) {
      return callback(err);
    }
    newEvent._id = newId;
    // Compute additional coodinate systems
    var newAltGeom = proj.getAltPositions(params.newGeom.coordinates);
    newEvent.data.newAltGeom = newAltGeom;
    // Emit the extended version.
    emitOne(newEvent);
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

  insertAndEmit(newEvent, callback);
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

  insertAndEmit(newEvent, callback);
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
    locationName: params.locationName,
    data: {},
  };

  insertAndEmit(newEvent, callback);
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
