/* eslint-disable max-lines */

var db = require('../../services/db');
var layersDal = require('../../../worker/layers/dal');
var eventsDal = require('../events/dal');

var shortid = require('shortid');

// Do not allow locations to be closer to each other.
var MIN_DISTANCE_METERS = 10;

exports.count = function (callback) {
  // Count non-deleted locations
  //
  // Parameters:
  //   callback
  //     function (err, number)

  var coll = db.get().collection('locations');

  coll.count({ deleted: false }).then(function (number) {
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
  //     tags
  //   callback
  //     function (err, rawLocation)
  //

  var geom = {
    type: 'Point',
    coordinates: [args.longitude, args.latitude],
  };

  layersDal.findLayerForPoint(geom, function (errl, layer, distance) {
    // Gives distance to the closest point in addition to layer number.
    var errclose;

    if (errl) {
      console.error(errl);
      return callback(errl);
    }

    if (distance < MIN_DISTANCE_METERS) {
      errclose = new Error('Too close to an existing location');
      errclose.name = 'ERROR_TOO_CLOSE';
      return callback(errclose);
    }

    var newLoc = {
      creator: args.username,
      deleted: false,
      geom: geom,
      isLayered: true,
      layer: layer,
      name: args.name,
      places: [],
      tags: args.tags,
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


  exports.createLocation({
    name: 'Unnamed ' + shortid.generate(),
    latitude: lat,
    longitude: lng,
    username: username,
    tags: [],
  }, callback);
};
