/* eslint-disable max-params */

var clustering = require('../services/clustering');
var errors = require('../errors');
var shortid = require('shortid');
var clone = require('clone');

var create = function (db, location, callback) {
  // Parameters:
  //   db
  //   location
  //     plain location object
  //   callback
  //     function (err, insertedLocation)
  //
  clustering.findLayerForPoint(db, location.geom, function (err, layer) {
    if (err) {
      return callback(err);
    }

    var coll = db.collection('locations');

    // Clone location before modification. This prevents possible
    // side effects. Also return this new instance afterwards.
    var loc = clone(location);
    loc.layer = layer;

    coll.insertOne(loc, function (err2, result) {
      if (err2) {
        return callback(err2);
      }

      loc._id = result.insertedId;

      return callback(null, loc);
    });
  });
};

var update = function (db, loc, callback) {
  // Note: findLayerForLocation ensures that the nearest neighbor point
  // is not the same location.
  clustering.findLayerForLocation(db, loc, function (err, layer) {
    if (err) {
      return callback(err);
    }

    var coll = db.collection('locations');

    loc.layer = layer;

    var q = { _id: loc._id };
    coll.findOneAndUpdate(q, loc, {}, function (err2, result) {
      if (err2) {
        return callback(err2);
      }

      var wasUpdated = result.lastErrorObject.updatedExisting;
      if (wasUpdated) {
        return callback(null, loc);
      }  // else was created
      return callback(null, result.value);
    });
  });
};

exports.put = function (db, loc, callback) {
  // Create or update a location.
  //
  // Parameters:
  //   db
  //     Monk db instance
  //   loc
  //     plain location object. If has _id, loc will be updated, insert otherw.
  //   callback
  //     function (err, updatedOrInsertedLoc)

  var updateExisting = loc.hasOwnProperty('_id');

  if (updateExisting) {
    update(db, loc, callback);
  } else {
    create(db, loc, callback);
  }
};

exports.get = function (db, loc, callback) {
  // Get single location
  //
  // Parameters:
  //   db
  //   loc
  //     plain object with _id property
  //   callback
  //     function (err, loc)
  //
  var coll = db.collection('locations');

  coll.findOne({ _id: loc._id }, {}, function (err, doc) {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(errors.NotFoundError);
    }

    return callback(null, doc);
  });
};

exports.del = function (db, loc, callback) {
  // Remove single location
  //
  // Parameters:
  //   db
  //   loc
  //     plain object with _id property
  //   callback
  //     function (err, deletedLocation)
  var coll = db.collection('locations');

  coll.findOneAndDelete({ _id: loc._id }).then(function (result) {
    // The removed doc is given as the result.value

    if (result.value === null) {
      return callback(errors.NotFoundError);
    }

    return callback(null, result.value);
  }).catch(function (err) {
    return callback(err);
  });
};

exports.count = function (db, callback) {
  // Count non-deleted locations
  //
  // Parameters:
  //   db
  //   callback
  //     function (err, number)

  var coll = db.collection('locations');

  coll.count({ deleted: false }).then(function (number) {
    return callback(null, number);
  }).catch(function (err) {
    return callback(err);
  });
};

exports.addAttachment = function (params, callback) {
  // Parameters:
  //   params
  //     object with properties:
  //       db
  //         Mongodb instance
  //       locationId
  //         string
  //       userName
  //         string
  //       filePathInUploadDir
  //         string
  //       fileMimeType
  //         string
  //  callback
  //    function (err, newEntry)

  var entry = {
    _id: shortid.generate(),
    time: (new Date()).toISOString(),
    type: 'attachment',
    user: params.userName,
    data: {
      filepath: params.filePathInUploadDir,
      mimetype: params.fileMimeType,
    },
  };

  var coll = params.db.collection('locations');

  var query = { _id: params.locationId };
  var updateq = { $push: { content: entry } };

  coll.updateOne(query, updateq, null, function (err, result) {
    if (err) {
      return callback(err);
    }

    console.log(result.result);

    return callback(null, entry);
  });
};
