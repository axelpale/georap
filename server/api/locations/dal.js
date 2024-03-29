/* eslint-disable max-lines */

const db = require('georap-db');
const layersDal = require('../../../worker/layers/dal');
const eventsDal = require('../events/dal');
const config = require('georap-config');

const shortid = require('shortid');

// Do not allow locations to be closer to each other.
const MIN_DISTANCE_METERS = 10;

exports.count = function (callback) {
  // Count non-deleted locations
  //
  // Parameters:
  //   callback
  //     function (err, number)
  //
  const coll = db.get().collection('locations');

  coll.countDocuments({ deleted: false }).then((number) => {
    return callback(null, number);
  }).catch((err) => {
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

  const geom = {
    type: 'Point',
    coordinates: [args.longitude, args.latitude],
  };

  layersDal.findLayerForPoint(geom, (errl, layer, distance, nearest) => {
    // Gives distance to the closest point in addition to layer number.
    if (errl) {
      console.error(errl);
      return callback(errl);
    }

    if (distance < MIN_DISTANCE_METERS) {
      const errclose = new Error('TOO_CLOSE');
      errclose.data = nearest;
      return callback(errclose);
    }

    const newLoc = {
      createdAt: db.timestamp(),
      deleted: false,
      geom: geom,
      name: args.name,
      places: [],
      published: false,
      status: config.locationStatuses[0],
      type: config.locationTypes[0],
      thumbnail: null,
      user: args.username, // location author, creator
      // To be modified by worker
      childLayer: 0,
      isLayered: true,
      layer: layer,
      points: 0,
      text1: '',
      text2: '',
    };

    const coll = db.collection('locations');

    coll.insertOne(newLoc, (err, result) => {
      if (err) {
        return callback(err);
      }

      newLoc._id = result.insertedId;

      eventsDal.createLocationCreated({
        locationId: newLoc._id,
        locationName: newLoc.name,
        lat: args.latitude,
        lng: args.longitude,
        username: newLoc.user,
        time: newLoc.createdAt,
      }, (err2) => {
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
      $unwind: {
        path: '$thumbnail',
        preserveNullAndEmptyArrays: true, // include locs without thumbnail
      },
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
