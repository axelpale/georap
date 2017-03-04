/* eslint-disable max-lines */

var db = require('../../services/db');
var googlemaps = require('../../services/googlemaps');
var layersDal = require('../../../worker/layers/dal');
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
  //
  // Parameters:
  //   lat
  //   lng
  //   username
  //   callback
  //     function (err, rawLocation)

  googlemaps.reverseGeocode([lat, lng], function (err0, places) {
    // Places is an array of strings

    if (err0) {
      console.error(err0);
      return callback(err0);
    }

    var geom = {
      type: 'Point',
      coordinates: [lng, lat],
    };

    layersDal.findLayerForPoint(geom, function (errl, layer) {
      if (errl) {
        console.error(errl);
        return callback(errl);
      }

      var newLoc = {
        creator: username,
        deleted: false,
        geom: geom,
        isLayered: true,
        layer: layer,
        name: shortid.generate(),
        places: places,
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
    });
  });  // .create

};
