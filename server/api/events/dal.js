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

exports.createLocationAttachmentCreated = function (params, callback) {
  // Parameters:
  //   params:
  //     entryId
  //     locationId
  //     username
  //     filePathInUploadDir
  //       string
  //     fileMimeType
  //       string

  var newEvent = {
    type: 'location_attachment_created',
    user: params.username,
    time: timestamp(),
    locationId: params.locationId,
    data: {
      entryId: params.entryId,
      filepath: params.filePathInUploadDir,
      mimetype: params.fileMimeType,
    },
  };

  insertAndEmit(newEvent, callback);
};

exports.createLocationAttachmentRemoved = function (params, callback) {
  // Parameters:
  //   params:
  //     entryId
  //     locationId
  //     username
  //   callback
  //     function (err)

  var newEvent = {
    type: 'location_attachment_removed',
    user: params.username,
    time: timestamp(),
    locationId: params.locationId,
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
  //     username

  var newEvent = {
    type: 'location_story_removed',
    user: params.username,
    time: timestamp(),
    locationId: params.locationId,
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
    data: {},
  };

  insertAndEmit(newEvent, callback);
};

exports.createLocationVisitCreated = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
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
  //     username
  //   callback
  //     function (err)

  var newEvent = {
    type: 'location_visit_removed',
    user: params.username,
    time: timestamp(),
    locationId: params.locationId,
    data: {
      entryId: params.entryId,
    },
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
  return exports.getRecentFiltered({}, n, page, callback);
};

exports.getRecentOfUser = function (username, n, page, callback) {
  return exports.getRecentFiltered({ user: username }, n, page, callback);
};

exports.getRecentFiltered = function (filter, n, page, callback) {
  // Parameters
  //   filter
  //     the value of $match operator. See
  //     https://docs.mongodb.com/manual/reference/operator/aggregation/match/
  //     Use {} to filter nothing.
  //   n
  //     number of events to return
  //   page
  //     page number. 0 = first page. Return range [n * page, n * (page + 1)[
  //     from the array of all events, ordered by time, most recent first
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
