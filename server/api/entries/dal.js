/* eslint-disable max-lines */
var db = require('../../services/db');
var eventsDal = require('../events/dal');

// Private methods

var timestamp = function () {
  return (new Date()).toISOString();
};

var insertOne = function (entry, callback) {
  // Parameters:
  //   entry
  //     entry to insert
  //   callback
  //     function (err, entryId);
  var coll = db.get().collection('entries');

  coll.insertOne(entry, function (err, result) {
    if (err) {
      return callback(err);
    }
    return callback(null, result.insertedId);
  });
};

var removeOne = function (entryId, callback) {
  // Parameters
  //   entryId
  //     object id
  //   callback
  //     function (err)

  var coll = db.get().collection('entries');
  var q = { _id: entryId };

  coll.remove(q, function (err) {
    if (err) {
      return callback(err);
    }
    return callback();
  });
};


// Public methods

exports.changeLocationStory = function (params, callback) {
  // Parameters:
  //   params:
  //     entryId
  //     locationId
  //     locationName
  //     newMarkdown
  //     username
  //   callback
  //     function (err)

  var coll = db.get().collection('entries');

  var q = { _id: params.entryId };
  var u = {
    $set: { 'data.markdown': params.newMarkdown },
  };

  coll.update(q, u, function (err) {
    if (err) {
      return callback(err);
    }

    eventsDal.createLocationStoryChanged(params, callback);
  });
};

exports.createLocationAttachment = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
  //       ObjectId
  //     locationName
  //       string
  //     username
  //     filePathInUploadDir
  //       string
  //     fileMimeType
  //       string
  //   callback
  //     function (err, insertedId)

  var newEntry = {
    type: 'location_attachment',
    user: params.username,
    time: timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    deleted: false,
    data: {
      filepath: params.filePathInUploadDir,
      mimetype: params.fileMimeType,
    },
  };

  insertOne(newEntry, function (err, entryId) {
    if (err) {
      return callback(err);
    }

    params.entryId = entryId;
    eventsDal.createLocationAttachmentCreated(params, callback);
  });
};

exports.createLocationStory = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
  //     username
  //     markdown
  //   callback
  //     function (err)

  var newEntry = {
    type: 'location_story',
    user: params.username,
    time: timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    deleted: false,
    data: {
      markdown: params.markdown,
    },
  };

  insertOne(newEntry, function (err, entryId) {
    if (err) {
      return callback(err);
    }

    params.entryId = entryId;
    eventsDal.createLocationStoryCreated(params, callback);
  });
};

exports.createLocationVisit = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
  //     locationName
  //     username
  //     year
  //       integer
  //   callback
  //     function (err, insertedId)

  var newEntry = {
    type: 'location_visit',
    user: params.username,
    time: timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      year: params.year,
    },
  };

  insertOne(newEntry, function (err, entryId) {
    if (err) {
      return callback(err);
    }

    params.entryId = entryId;
    eventsDal.createLocationVisitCreated(params, callback);
  });
};

exports.getAllOfLocation = function (locationId, callback) {
  // Parameters
  //   locationId
  //     object id
  //   callback
  //     function (err, entries)

  var coll = db.get().collection('entries');
  var q = {
    locationId: locationId,
    deleted: false,
  };
  var opt = { sort: { time: -1 } };

  return coll.find(q, opt).toArray(callback);
};


exports.removeLocationAttachment = function (params, callback) {
  // Parameters:
  //   params:
  //     entryId
  //     locationId
  //     locationName
  //     username
  //   callback
  //     function (err)

  removeOne(params.entryId, function (err) {
    if (err) {
      return callback(err);
    }

    eventsDal.createLocationAttachmentRemoved(params, callback);
  });
};

exports.removeLocationStory = function (params, callback) {
  // Parameters:
  //   params
  //     entryId
  //     locationId
  //     locationName
  //     username
  //   callback
  //     function (err)
  removeOne(params.entryId, function (err) {
    if (err) {
      return callback(err);
    }

    eventsDal.createLocationStoryRemoved(params, callback);
  });
};

exports.removeLocationVisit = function (params, callback) {
  // Parameters:
  //   params
  //     entryId
  //     locationId
  //     locationName
  //     username
  //   callback
  //     function (err)
  removeOne(params.entryId, function (err) {
    if (err) {
      return callback(err);
    }

    eventsDal.createLocationVisitRemoved(params, callback);
  });
};
