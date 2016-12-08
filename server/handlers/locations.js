
var errors = require('../errors');
var clustering = require('../services/clustering');
var model = require('../models/locations');
var handleToken = require('./lib/handleToken');
var handleObjectId = require('./lib/handleObjectId');
var prepareForClient = require('./lib/prepareForClient');

// Precompile schemas
var putSchema = require('./schemas/locations/put');
var getSchema = require('./schemas/locations/get');
var delSchema = require('./schemas/locations/del');
var countSchema = require('./schemas/locations/count');
var Validator = require('ajv');
var validator = new Validator();
var validatePut = validator.compile(putSchema);
var validateGet = validator.compile(getSchema);
var validateDel = validator.compile(delSchema);
var validateCount = validator.compile(countSchema);


exports.put = function (db, data, response) {
  // Add or update new location

  var valid = validatePut(data);

  if (!valid) {
    return response(errors.responses.InvalidRequestError);
  }

  var thenPut = function () {
    model.put(db, data.location, function (err, loc) {
      if (err) {
        return response(errors.responses.DatabaseError);
      }

      // Transform location to be suitable for the client.
      prepareForClient.location(loc);

      return response({ success: loc });
    });
  };

  handleToken(data.token, response, function () {
    if (data.location.hasOwnProperty('_id')) {
      return handleObjectId(data.location._id, response, function (objId) {
        data.location._id = objId;
        return thenPut();
      });
    }
    return thenPut();
  });
};

exports.get = function (db, data, response) {

  var valid = validateGet(data);

  if (!valid) {
    return response(errors.responses.InvalidRequestError);
  }

  handleToken(data.token, response, function success() {
    handleObjectId(data.location._id, response, function success(objId) {

      data.location._id = objId;

      model.get(db, data.location, function (err, loc) {
        if (err) {
          if (err.name === 'NotFoundError') {
            return response(errors.responses.NotFoundError);
          }
          return response(errors.responses.DatabaseError);
        }

        // Transform location to be suitable for the client.
        prepareForClient.location(loc);

        return response({ success: loc });
      });
    });
  });
};

exports.del = function (db, data, response) {
  // Parameters:
  //   db
  //   data
  //   response
  //     function (responseObject)

  var valid = validateDel(data);

  if (!valid) {
    return response(errors.responses.InvalidRequestError);
  }

  handleToken(data.token, response, function () {
    handleObjectId(data.location._id, response, function (objId) {

      data.location._id = objId;

      model.del(db, data.location, function (err, loc) {
        if (err) {
          if (err.name === 'NotFoundError') {
            return response(errors.responses.NotFoundError);
          }
          return response(errors.responses.DatabaseError);
        }

        // Transform location to be suitable for the client.
        prepareForClient.location(loc);

        return response({ success: loc });
      });
    });
  });
};

exports.count = function (db, data, response) {
  // Retrieve the number of locations.

  var valid = validateCount(data);

  if (!valid) {
    return response(errors.responses.InvalidRequestError);
  }

  handleToken(data.token, response, function () {
    model.count(db, function (err, num) {
      if (err) {
        console.error(err);
        return response(errors.responses.DatabaseError);
      }
      return response({ success: num });
    });
  });
};

exports.getMarkersWithin = function (db, data, response) {
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
