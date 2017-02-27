/* eslint-disable max-lines */
var db = require('../../services/db');
var io = require('../../services/io');

// Private methods

var timestamp = function () {
  return (new Date()).toISOString();
};

var emitOne = function (ev) {
  if (!ev.hasOwnProperty('_id')) {
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

exports.createLocationAttachmentCreated = function (params, callback) {
  // Parameters:
  //   params:
  //     entryId
  //     locationId
  //     locationName
  //     username
  //     filePathInUploadDir
  //       string
  //     fileMimeType
  //       string
  //     thumbPathInUploadDir
  //       string
  //     thumbMimeType
  //       string

  var newEvent = {
    type: 'location_attachment_created',
    user: params.username,
    time: timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
      filepath: params.filePathInUploadDir,
      mimetype: params.fileMimeType,
      thumbpath: params.thumbPathInUploadDir,
      thumbmimetype: params.thumbMimeType,
    },
  };

  insertAndEmit(newEvent, callback);
};

exports.createLocationAttachmentRemoved = function (params, callback) {
  // Parameters:
  //   params:
  //     entryId
  //     locationId
  //     locationName
  //     username
  //   callback
  //     function (err)

  var newEvent = {
    type: 'location_attachment_removed',
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

  insertAndEmit(newEvent, callback);
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

exports.createLocationStoryChanged = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
  //     locationName
  //     entryId
  //     username
  //     newMarkdown

  if (typeof params.entryId !== 'object') {
    throw new Error('invalid entryId type');
  }

  var newEvent = {
    type: 'location_story_changed',
    user: params.username,
    time: timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
      newMarkdown: params.newMarkdown,
    },
  };

  insertAndEmit(newEvent, callback);
};

exports.createLocationStoryCreated = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
  //     locationName
  //     entryId
  //     username
  //     markdown

  if (typeof params.entryId !== 'object') {
    throw new Error('invalid entryId type');
  }

  var newEvent = {
    type: 'location_story_created',
    user: params.username,
    time: timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
      markdown: params.markdown,
    },
  };

  insertAndEmit(newEvent, callback);
};

exports.createLocationStoryRemoved = function (params, callback) {
  // Parameters:
  //   params:
  //     entryId
  //     locationId
  //     locationName
  //     username

  var newEvent = {
    type: 'location_story_removed',
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

exports.createLocationTagsChanged = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
  //     locationName
  //     username
  //     newTags
  //       array of strings
  //     oldTags
  //       array of string

  var newEvent = {
    type: 'location_tags_changed',
    user: params.username,
    time: timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      newTags: params.newTags,
      oldTags: params.oldTags,
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

exports.createLocationVisitCreated = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
  //     locationName
  //     username
  //     year
  //       integer
  //   callback
  //     function (err)

  var newEvent = {
    type: 'location_visit_created',
    user: params.username,
    time: timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
      year: params.year,
    },
  };

  insertAndEmit(newEvent, callback);
};

exports.createLocationVisitRemoved = function (params, callback) {
  // Parameters:
  //   params:
  //     entryId
  //     locationId
  //     locationName
  //     username
  //   callback
  //     function (err)

  var newEvent = {
    type: 'location_visit_removed',
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

exports.getAllOfUser = function (username, callback) {
  // Parameters
  //   username
  //     string
  //   callback
  //     function (err, events)

  var coll = db.get().collection('events');

  coll.find({ user: username }).toArray(callback);
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
    // {
    //   // Join with location data
    //   $lookup: {
    //     from: 'locations',
    //     localField: 'locationId',
    //     foreignField: '_id',
    //     as: 'location',
    //   },
    // },
    // {
    //   // Change the location array to the single location (the first item).
    //   $unwind: '$location',
    // },
  ], function (err, docs) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    return callback(null, docs);
  });
};
