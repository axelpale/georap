/* eslint-disable max-lines,no-magic-numbers */

var db = require('../../services/db');
var eventsDal = require('../events/dal');
var path = require('path');
var _ = require('lodash');

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
  var coll = db.collection('entries');

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
  //     locationName
  //       because entries do not store location name but events do
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
    deleted: params.oldEntry.deleted,
    data: {
      markdown: params.markdown,
      isVisit: params.isVisit,
      filepath: params.filepath,
      mimetype: params.mimetype,
      thumbfilepath: params.thumbfilepath,
      thumbmimetype: params.thumbmimetype,
    },
    comments: params.oldEntry.comments,
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
  //     overlay
  //       overlay-import object or null
  //   callback
  //     function (err, insertedId)

  var newEntry = {
    type: 'location_entry',
    user: params.username,
    time: timestamp(),
    locationId: params.locationId,
    deleted: false,
    data: {
      markdown: params.markdown,
      isVisit: params.isVisit,
      filepath: params.filepath,
      mimetype: params.mimetype,
      thumbfilepath: params.thumbfilepath,
      thumbmimetype: params.thumbmimetype,
      overlay: params.overlay ? params.overlay : null,
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


exports.filterUniqueLocationEntries = function (args, callback) {
  // Append given entries into the given location if they do not yet exist.
  //
  // Parameters
  //   args
  //     locationId
  //       ObjectId
  //     entryCandidates
  //       array of objects:
  //         username
  //         markdown
  //         filepath
  //           basename is compared
  //   callback
  //     function (err, uniqueEntries)
  //       err
  //       uniqueEntries
  //         subset of given entryCandidates

  exports.getAllOfLocation(args.locationId, function (err, realEntries) {
    if (err) {
      return callback(err);
    }

    var newEntries = args.entryCandidates.filter(function (ec) {
      // Pass only those entry candidates that differ from every current
      // entry. Entry is different if creator, text, OR file basename differs.
      return _.every(realEntries, function isDifferent(re) {
        // Paths are null for descriptions
        var reBase = re.data.filepath ? path.basename(re.data.filepath) : null;
        var ecBase = ec.filepath ? path.basename(ec.filepath) : null;
        return (re.user !== ec.username ||
                re.data.markdown !== ec.markdown ||
                reBase !== ecBase);
      });
    });

    return callback(null, newEntries);

    // asyn.eachSeries(newEntries, function (ne, next) {
    //   exports.createLocationEntry({
    //
    //   }, next);
    // }, function then(errs) {
    //   if (errs) {
    //     return callback(errs);
    //   }
    //
    //   return callback();
    // });
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

  var coll = db.collection('entries');
  var q = {
    locationId: locationId,
    deleted: false,
  };
  var opt = { sort: { time: -1 } };

  return coll.find(q, opt).toArray(callback);
};


exports.getAllOfUser = function (username, callback) {
  // Return all entries created by user, ordered from oldest to newest.
  //
  // Parameters
  //   username
  //     string
  //   callback
  //     function (err, entries)

  var coll = db.collection('entries');
  var q = {
    user: username,
    deleted: false,
  };

  coll.find(q).sort({ time: 1 }).toArray(callback);
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


exports.createLocationEntryComment = function (params, callback) {
  // Parameters:
  //   params
  //     locationId
  //     entryId
  //     locationName
  //     username
  //     message: UTF8 string TODO prevent script attack
  //   callback
  //     function (err)

  var coll = db.collection('entries');
  var filter = { _id: params.entryId };

  var time = timestamp();
  var commentId = time.substr(0, 4) + Math.random().toString().substr(2);

  var update = {
    $push: {
      comments: {
        id: commentId,
        time: time,
        user: params.username,
        message: params.message,
      },
    },
  };

  coll.updateOne(filter, update, function (err) {
    if (err) {
      return callback(err);
    }

    var eventParams = Object.assign({}, params, {
      commentId: commentId,
      time: time,
    });

    eventsDal.createLocationEntryCommentCreated(eventParams, callback);
  });
};
