
var errors = require('../errors');
var clustering = require('../services/clustering');
var attachments = require('../services/attachments');
var model = require('../models/locations');
var handleToken = require('./lib/handleToken');

var ObjectId = require('mongodb').ObjectId;
var mime = require('mime');


exports.addOne = function (db, data, response) {
  // Add new location
  //
  // Parameters:
  //   db
  //     Monk db instance
  //   data
  //     token
  //       JWT token string
  //     geom
  //       GeoJSON point
  //   response
  //     Socket.io response
  var coords;

  // Request validation

  if (typeof data.geom !== 'object' || data.geom.type !== 'Point' ||
      typeof data.geom.coordinates !== 'object') {
    return response(errors.responses.InvalidRequestError);
  }

  coords = data.geom.coordinates;

  if (coords.length !== 2 || typeof coords[0] !== 'number' ||
      typeof coords[1] !== 'number') {
    return response(errors.responses.InvalidRequestError);
  }

  // Token check
  handleToken(data.token, response, function (payload) {

    model.create(db, payload.name, data.geom, function (err2, newLoc) {
      if (err2) {
        return response(errors.responses.DatabaseError);
      }

      return response({
        success: newLoc,
      });
    });
  });
};

exports.getOne = function (db, data, response) {
  // Parameters
  //   db
  //     Monk db instance
  //   data
  //     token
  //       JWT token string
  //     locationId
  //       valid object id as string
  //   response
  //     Socket.io response
  var objId;

  if (typeof data.locationId !== 'string') {
    return response(errors.responses.InvalidRequestError);
  }

  try {
    objId = new ObjectId(data.locationId);
  } catch (e) {
    return response(errors.responses.InvalidRequestError);
  }

  handleToken(data.token, response, function () {

    var locations = db.get('locations');

    locations.findOne({ _id: objId }).then(function (loc) {
      if (loc) {

        // Transform location to be suitable for the client.
        loc.content = loc.content.map(function (entry) {
          if (entry.type === 'attachment') {
            // Attach an url to each attachment.
            entry.data.url = attachments.getAbsoluteUrl(entry);

            // Figure out the content mime type.
            if (!entry.data.hasOwnProperty('mimetype')) {
              entry.data.mimetype = mime.lookup(entry.data.filename);
            }
          }
          return entry;
        });

        return response({
          success: loc,
        });
      }

      return response(errors.responses.NotFoundError);
    }).catch(function (err2) {
      console.error(err2);
      return response(errors.responses.DatabaseError);
    });
  });
};

exports.getWithin = function (db, data, response) {
  // Parameters:
  //   db
  //     Monk db instance
  //   data
  //     token
  //       JWT token
  //     center
  //       [lng, lat] array
  //     radius
  //       max distance from the center in meters
  //     layer
  //       equals to zoom level. Get only locations on this and higher layers.
  //   response
  //     Socket.io response
  //
  // Response on success:
  //   {
  //     locations: arrayOfLocations
  //   }

  // Validate the request to prevent injection
  var validRequest = (data.hasOwnProperty('center') &&
                      typeof data.center === 'object' &&
                      typeof data.center[0] === 'number' &&
                      typeof data.center[1] === 'number' &&
                      'length' in data.center &&
                      data.center.length === 2 &&
                      data.hasOwnProperty('radius') &&
                      typeof data.radius === 'number') &&
                      data.hasOwnProperty('layer') &&
                      typeof data.layer === 'number';

  if (!validRequest) {
    return response(errors.responses.InvalidRequestError);
  }  // else

  handleToken(data.token, response, function () {

    clustering.findWithin({
      db: db,
      center: data.center,
      radius: data.radius,
      // Only locations on the layer or higher (smaller layer number).
      query: {
        layer: { $lte: data.layer },
        deleted: false,
      },
      callback: function (err2, locs) {
        if (err2) {
          console.error(err2);

          return response(errors.responses.DatabaseError);
        }  // else

        return response({
          success: locs,
        });
      },
    });

  });
};


exports.rename = function (db, data, response) {
  // Parameters:
  //   db
  //     Monk db instance
  //   data
  //     token
  //       string
  //     locationId
  //       string, ObjectId compatible
  //     newName
  //       string
  //   response
  //     Socket.io response
  handleToken(data.token, response, function (payload) {
    var validRequest, id, username, newName;

    validRequest = (typeof data.locationId === 'string' &&
                    typeof data.newName === 'string');

    if (!validRequest) {
      return response(errors.responses.InvalidRequestError);
    }

    try {
      id = new ObjectId(data.locationId);
    } catch (e) {
      return response(errors.responses.InvalidRequestError);
    }

    username = payload.name;
    newName = data.newName.trim();

    model.rename(db, username, id, newName, function (err, updatedLoc) {
      if (err) {
        if (err.name === 'NotFoundError') {
          return response(errors.responses.NotFoundError);
        }
        return response(errors.responses.DatabaseError);
      }

      return response({
        success: updatedLoc,
      });
    });
  });
};
