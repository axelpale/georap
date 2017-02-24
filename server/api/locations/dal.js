/* eslint-disable max-lines */

var db = require('../../services/db');
var eventsDal = require('../events/dal');

var shortid = require('shortid');

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

exports.create = function (lat, lng, username, callback) {
  // Create a location to given coordinates with a code name.

  var newLoc = {
    creator: username,
    deleted: false,
    geom: {
      type: 'Point',
      coordinates: [lng, lat],
    },
    layer: 1,
    name: shortid.generate(),
    tags: [],
  };

  var coll = db.get().collection('locations');

  coll.insertOne(newLoc, function (err, result) {
    if (err) {
      return callback(err);
    }

    newLoc._id = result.insertedId;

    eventsDal.createLocationCreated({
      locationId: newLoc._id,
      locationName: newLoc.name,
      lat: lat,
      lng: lng,
      username: username,
    }, function (err2) {
      if (err2) {
        return callback(err2);
      }
      return callback(null, newLoc);
    });
  });
};
