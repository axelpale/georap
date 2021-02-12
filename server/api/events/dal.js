/* eslint-disable max-lines */
//
// Location events
//

var db = require('tresdb-db');
var io = require('../../services/io');
var proj = require('../../services/proj');

// Private methods

var timestamp = function () {
  return (new Date()).toISOString();
};

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
    time: timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      lat: params.lat,
      lng: params.lng,
    },
  };

  insertAndEmit(newEvent, callback);
};

exports.createLocationEntryChanged = function (params, callback) {
  // Parameters:
  //   params:
  //     oldEntry
  //       raw entry object
  //     locationName
  //       string
  //     markdown
  //       string or null
  //     isVisit
  //       boolean
  //     filepath
  //       string or null
  //       The relative path of the file in the uploads dir
  //     mimetype
  //       string or null
  //     thumbfilepath
  //       string or null
  //       The relative path of the thumbnail file in the uploads dir
  //     thumbmimetype
  //       string or null

  if (typeof params.oldEntry._id !== 'object') {
    throw new Error('invalid entryId type');
  }

  var newEvent = {
    type: 'location_entry_changed',
    user: params.oldEntry.user,
    time: timestamp(),
    locationId: params.oldEntry.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.oldEntry._id,
      oldMarkdown: params.oldEntry.data.markdown,
      newMarkdown: params.markdown,
      oldIsVisit: params.oldEntry.data.isVisit,
      newIsVisit: params.isVisit,
      oldFilepath: params.oldEntry.data.filepath,
      newFilepath: params.filepath,
      oldMimetype: params.oldEntry.data.mimetype,
      newMimetype: params.mimetype,
      oldThumbfilepath: params.oldEntry.data.thumbfilepath,
      newThumbfilepath: params.thumbfilepath,
      oldThumbmimetype: params.oldEntry.data.thumbmimetype,
      newThumbmimetype: params.thumbmimetype,
    },
  };

  insertAndEmit(newEvent, callback);
};

exports.createLocationEntryCreated = function (params, callback) {
  // Parameters:
  //   params:
  //     entryId
  //     locationId
  //     locationName
  //     username
  //     markdown
  //       string or null
  //     isVisit
  //       boolean
  //     filepath
  //       string or null
  //       The relative path of the file in the uploads dir
  //     mimetype
  //       string or null
  //     thumbfilepath
  //       string or null
  //       The relative path of the thumbnail file in the uploads dir
  //     thumbmimetype
  //       string or null
  //   callback
  //     function (err)
  //
  var newEvent = {
    type: 'location_entry_created',
    user: params.username,
    time: timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
      markdown: params.markdown,
      isVisit: params.isVisit,
      filepath: params.filepath,
      mimetype: params.mimetype,
      thumbfilepath: params.thumbfilepath,
      thumbmimetype: params.thumbmimetype,
    },
  };

  insertAndEmit(newEvent, callback);
};

exports.createLocationEntryRemoved = function (params, callback) {
  // Parameters:
  //   params:
  //     entryId
  //     locationId
  //     locationName
  //     username
  //   callback
  //     function (err)
  //
  var newEvent = {
    type: 'location_entry_removed',
    user: params.username,
    time: timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
    },
  };

  insertAndEmit(newEvent, callback);
};

exports.createLocationEntryCommentCreated = function (params, callback) {
  // Parameters:
  //   params:
  //     entryId
  //     locationId
  //     locationName
  //     username
  //     commentId
  //     time
  //     message
  //   callback
  //     function (err)

  var newEvent = {
    type: 'location_entry_comment_created',
    user: params.username,
    time: params.time,
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
      commentId: params.commentId,
      message: params.message,
    },
  };

  insertAndEmit(newEvent, callback);
};

exports.createLocationEntryCommentChanged = function (params, callback) {
  // Parameters:
  //   params:
  //     username
  //     locationId
  //     locationName
  //     entryId
  //     commentId
  //     newMessage
  //   callback
  //     function (err)

  var newEvent = {
    type: 'location_entry_comment_changed',
    user: params.username,
    time: timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
      commentId: params.commentId,
      newMessage: params.newMessage,
    },
  };

  insertAndEmit(newEvent, callback);
};

exports.createLocationEntryCommentRemoved = function (params, callback) {
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

  var newEvent = {
    type: 'location_entry_comment_removed',
    user: params.username,
    time: timestamp(),
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
    time: timestamp(),
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
    time: timestamp(),
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
    time: timestamp(),
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
    time: timestamp(),
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
