/* eslint-disable max-lines */

var db = require('../../services/db');
var shortid = require('shortid');
var eventsDal = require('../events/dal');

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
  // Create a location to given coordinates.

  var now = (new Date()).toISOString();

  var newLoc = {
    content: [{
      _id: shortid.generate(),
      type: 'created',
      user: username,
      time: now,
      data: {
        lat: lat,
        lng: lng,
      },
    }],
    deleted: false,
    geom: {
      type: 'Point',
      coordinates: [lng, lat],
    },
    layer: 1,
    name: '',
    tags: [],
  };

  var coll = db.get().collection('locations');

  coll.insertOne(newLoc, function (err, result) {
    if (err) {
      return callback(err);
    }

    var id = result.insertedId;
    newLoc._id = id;

    eventsDal.createLocationCreated({
      locationId: id,
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
