
var db = require('../../services/db');
var eventsDal = require('../events/dal');

// Private methods

var timestamp = function () {
  return (new Date()).toISOString();
};

var insertOne = function (entry, callback) {
  // Parameters:
  //   entry
  //     raw entry to insert
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

exports.changeLocationEntry = function (params, callback) {
  // Parameters:
  //   params:
  //     oldEntry
  //       raw entry object
  //     markdown
  //     isVisit
  //     filepath
  //     mimetype
  //     thumbfilepath
  //     thumbmimetype
  //   callback
  //     function (err)

  var coll = db.collection('entries');
  var q = { _id: params.oldEntry._id };

  var changedEntry = {
    type: 'location_entry',
    user: params.oldEntry.user,
    time: params.oldEntry.time,
    locationId: params.oldEntry.locationId,
    locationName: params.oldEntry.locationName,
    deleted: params.oldEntry.deleted,
    data: {
      markdown: params.markdown,
      isVisit: params.isVisit,
      filepath: params.filepath,
      mimetype: params.mimetype,
      thumbfilepath: params.thumbfilepath,
      thumbmimetype: params.thumbmimetype,
    },
  };

  coll.replaceOne(q, changedEntry, function (err) {
    if (err) {
      return callback(err);
    }

    eventsDal.createLocationEntryChanged(params, callback);
  });
};

exports.createLocationEntry = function (params, callback) {
  // Parameters:
  //   params:
  //     locationId
  //       ObjectId
  //     locationName
  //       string
  //     username
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
  //   callback
  //     function (err, insertedId)

  var newEntry = {
    type: 'location_entry',
    user: params.username,
    time: timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    deleted: false,
    data: {
      markdown: params.markdown,
      isVisit: params.isVisit,
      filepath: params.filepath,
      mimetype: params.mimetype,
      thumbfilepath: params.thumbfilepath,
      thumbmimetype: params.thumbmimetype,
    },
  };

  insertOne(newEntry, function (err, entryId) {
    if (err) {
      return callback(err);
    }

    params.entryId = entryId;
    eventsDal.createLocationEntryCreated(params, callback);
  });
};


exports.getOneRaw = function (entryId, callback) {
  // Find single entry
  //
  var coll = db.collection('entries');
  var q = {
    _id: entryId,
  };
  var opt = {};

  coll.findOne(q, opt, function (err, doc) {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(null, null);
    }

    return callback(null, doc);
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


exports.removeLocationEntry = function (params, callback) {
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

    eventsDal.createLocationEntryRemoved(params, callback);
  });
};
