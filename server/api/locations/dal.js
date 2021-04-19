/* eslint-disable max-lines */

var db = require('tresdb-db');
var layersDal = require('../../../worker/layers/dal');
var eventsDal = require('../events/dal');
var config = require('tresdb-config');

var shortid = require('shortid');

// Do not allow locations to be closer to each other.
var MIN_DISTANCE_METERS = 10;

exports.count = function (callback) {
  // Count non-deleted locations
  //
  // Parameters:
  //   callback
  //     function (err, number)
  //
  var coll = db.get().collection('locations');

  coll.countDocuments({ deleted: false }).then(function (number) {
    return callback(null, number);
  }).catch(function (err) {
    return callback(err);
  });
};

exports.createLocation = function (args, callback) {
  // Parameters
  //   args
  //     name
  //     latitude
  //     longitude
  //     username
  //   callback
  //     function (err, rawLocation)
  //

  var geom = {
    type: 'Point',
    coordinates: [args.longitude, args.latitude],
  };

  layersDal.findLayerForPoint(geom, function (errl, layer, distance, nearest) {
    // Gives distance to the closest point in addition to layer number.
    if (errl) {
      console.error(errl);
      return callback(errl);
    }

    if (distance < MIN_DISTANCE_METERS) {
      var errclose = new Error('TOO_CLOSE');
      errclose.data = nearest;
      return callback(errclose);
    }

    var newLoc = {
      creator: args.username,
      deleted: false,
      published: false,
      geom: geom,
      isLayered: true,
      layer: layer,
      name: args.name,
      places: [],
      status: config.locationStatuses[0],
      type: config.locationTypes[0],
      thumbnail: null,
      visits: [],
    };

    var coll = db.collection('locations');

    coll.insertOne(newLoc, function (err, result) {
      if (err) {
        return callback(err);
      }

      newLoc._id = result.insertedId;

      eventsDal.createLocationCreated({
        locationId: newLoc._id,
        locationName: newLoc.name,
        lat: args.latitude,
        lng: args.longitude,
        username: newLoc.creator,
      }, function (err2) {
        if (err2) {
          return callback(err2);
        }
        return callback(null, newLoc);
      });
    });
  });
};

exports.create = function (lat, lng, username, callback) {
  // Create a location to given coordinates with a code name.
  //
  // Parameters:
  //   lat
  //   lng
  //   username
  //   callback
  //     function (err, rawLocation)
  //

  exports.createLocation({
    name: 'Unnamed ' + shortid.generate(),
    latitude: lat,
    longitude: lng,
    username: username,
  }, callback);
};

exports.latestComplete = (range, callback) => {
  // Find n latest, non-deleted locations
  //
  // Parameters:
  //   range
  //     skip
  //       integer
  //     limit
  //       integer
  //   callback
  //     function (err, array of locations)
  //
  db.collection('locations').aggregate([
    {
      $match: {
        deleted: false,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: range.skip,
    },
    {
      $limit: range.limit,
    },
    {
      $lookup: {
        from: 'attachments',
        localField: 'thumbnail',
        foreignField: 'key',
        as: 'thumbnail',
      },
    },
    {
      $unwind: '$thumbnail',
    },
  ]).toArray(callback);
};

exports.search = (params, callback) => {
  // Find locations. If more detailed queries are needed, see
  // /api/markers/dal.getFiltered

  const q = {
    $text: {
      $search: params.phrase,
    },
    deleted: false,
  };

  db.collection('locations')
    .find(q)
    .skip(params.skip)
    .limit(params.limit)
    .toArray(callback);
};
