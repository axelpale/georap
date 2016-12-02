/* eslint-disable max-params */

var clustering = require('../services/clustering');
var errors = require('../errors');

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

  clustering.findLayerForPoint(db, loc.geom, function (err, layer) {
    if (err) {
      return callback(err);
    }

    var coll = db.collection('locations');

    loc.layer = layer;

    var opts = { upsert: true };
    coll.findOneAndUpdate({ _id: loc._id }, loc, opts, function (err2, result) {
      if (err2) {
        return callback(err2);
      }

      return callback(null, result.value);
    });
  });
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
    console.log('findOne result', doc);

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
    //console.log('findOneAndDelete result', result);
    // The removed doc is given as the result.
    //if (result.result.value) {
    //  return callback(errors.NotFoundError);
    //}
    return callback(null, result);
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
