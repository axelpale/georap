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
  //     newMarkdown
  //     username
  //   callback
  //     function (err)

  var coll = db.get().collection('entries');
  var q = {
    _id: params.entryId,
  };
  var u = {
    $set: { 'data.markdown': params.newMarkdown },
  };

  coll.update(q, u, function (err) {
    if (err) {
      return callback(err);
    }

    eventsDal.createLocationStoryChanged({
      entryId: params.entryId,
      locationId: params.locationId,
      newMarkdown: params.newMarkdown,
      username: params.username,
    }, callback);
  });
};

exports.createLocationAttachment = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
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

    eventsDal.createLocationAttachmentCreated({
      entryId: entryId,
      locationId: params.locationId,
      username: params.username,
      filePathInUploadDir: params.filePathInUploadDir,
      fileMimeType: params.fileMimeType,
    }, callback);
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
    deleted: false,
    data: {
      markdown: params.markdown,
    },
  };

  insertOne(newEntry, function (err, entryId) {
    if (err) {
      return callback(err);
    }

    eventsDal.createLocationStoryCreated({
      entryId: entryId,
      locationId: params.locationId,
      username: params.username,
      markdown: params.markdown,
    }, callback);
  });
};

exports.createLocationVisit = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
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
    data: {
      year: params.year,
    },
  };

  insertOne(newEntry, function (err, entryId) {
    if (err) {
      return callback(err);
    }

    eventsDal.createLocationVisitCreated({
      entryId: entryId,
      locationId: params.locationId,
      username: params.username,
      year: params.year,
    }, callback);
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
