/* eslint-disable max-lines */

var db = require('../../services/db');
var googlemaps = require('../../services/googlemaps');
var layersDal = require('../../../worker/layers/dal');
var eventsDal = require('../events/dal');

var shortid = require('shortid');
var sax = require('sax');

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

exports.readKML = function (buffer, callback) {
  // Find an array of locations from a KML file.
  //
  // Parameters
  //   buffer
  //     a Buffer that represents KML file
  //   callback
  //     function (err, locations)

  var strict = true;
  var parser = sax.parser(strict);

  // Finished locations are collected here.
  var locations = [];

  // Currently processed location is built here.
  // After location is successfully built, it is added to locations array
  // and loc is set back to null.
  var loc = null;
  var nameTag = false;
  var pointTag = false;
  var coordinatesTag = false;

  parser.onerror = function (err) {
    console.log('ERROR', err);
  };
  parser.ontext = function (t) {
    console.log('text:', t);
    if (nameTag) {
      loc.name = t;
    } else if (pointTag && coordinatesTag) {
      loc.coordinates = t;
    }
  };
  parser.onopentag = function (node) {
    // opened a tag.  node has "name" and "attributes"
    console.log('opentag:', node);
    var tag = node.name;

    if (node.name === 'Placemark') {
      loc = {};
    } else if (loc) {
      if (tag === 'name') {
        nameTag = true;
      } else if (tag === 'Point') {
        pointTag = true;
      } else if (tag === 'coordinates') {
        coordinatesTag = true;
      }
    }
  };
  parser.onclosetag = function (tag) {
    console.log('closetag:', tag);

    if (tag === 'Placemark') {
      if (loc.hasOwnProperty('name') && loc.hasOwnProperty('coordinates')) {
        locations.push(loc);
      }
      loc = null;
    } else if (tag === 'name') {
      nameTag = false;
    } else if (tag === 'Point') {
      pointTag = false;
    } else if (tag === 'coordinates') {
      coordinatesTag = false;
    }
  };
  parser.onattribute = function (attr) {
    // an attribute.  attr has "name" and "value"
    console.log('attr:', attr);
  };
  parser.onend = function () {
    // parser stream is done, and ready to have more stuff written to it.
    console.log('end');

    callback(null, locations);
  };

  parser.write(buffer).close();
};

exports.readKMZ = function (buffer, callback) {
  // KMZ is a zipped collection of resources and KML files.

  // dummy
  return exports.readKMZ(buffer, callback);
};

exports.readGPX = function (buffer, callback) {
  // Find an array of locations from a GPX file.
  //
  // Parameters
  //   buffer
  //     a Buffer that represents GPX file
  //   callback
  //     function (err, locations)

  // dummy
  return callback(null, [
    {
      name: 'Fooloc',
      lat: 62.0,
      lng: 23.0,
      description: 'This is a location from GPX',
    },
  ]);
};
