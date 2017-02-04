
var db = require('../services/db');
var errors = require('../errors');
var clustering = require('../services/clustering');
var model = require('../models/locations');
var handleToken = require('./lib/handleToken');

var prepareForModel = require('./lib/prepareForModel');
var prepareForClient = require('./lib/prepareForClient');

// Precompile schemas
var putSchema = require('./schemas/locations/put');
var getSchema = require('./schemas/locations/get');
var delSchema = require('./schemas/locations/del');
var countSchema = require('./schemas/locations/count');
var Ajv = require('ajv');
var validator = new Ajv();
var validatePut = validator.compile(putSchema);
var validateGet = validator.compile(getSchema);
var validateDel = validator.compile(delSchema);
var validateCount = validator.compile(countSchema);


exports.put = function (data, response) {
  // Add or update new location

  var valid = validatePut(data);

  if (!valid) {
    console.log('Invalid locations put payload:');
    console.log(data);
    return response(errors.responses.InvalidRequestError);
  }

  handleToken(data.token, response, function () {
    // Transform location to be suitable for the model
    try {
      prepareForModel.location(data.location);
    } catch (e) {
      return response(errors.responses.InvalidRequestError);
    }

    model.put(db.get(), data.location, function (err, loc) {
      if (err) {
        return response(errors.responses.DatabaseError);
      }

      // Transform location to be suitable for the client.
      prepareForClient.location(loc);

      return response({ success: loc });
    });
  });
};

exports.get = function (data, response) {

  var valid = validateGet(data);

  if (!valid) {
    return response(errors.responses.InvalidRequestError);
  }

  handleToken(data.token, response, function () {

    // Transform location to be suitable for the model
    try {
      prepareForModel.location(data.location);
    } catch (e) {
      return response(errors.responses.InvalidRequestError);
    }

    model.get(db.get(), data.location, function (err, loc) {
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
};

exports.del = function (data, response) {
  // Parameters:
  //   data
  //   response
  //     function (responseObject)

  var valid = validateDel(data);

  if (!valid) {
    return response(errors.responses.InvalidRequestError);
  }

  handleToken(data.token, response, function () {

    // Transform location to be suitable for the model
    try {
      prepareForModel.location(data.location);
    } catch (e) {
      return response(errors.responses.InvalidRequestError);
    }

    model.del(db.get(), data.location, function (err, loc) {
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
};

exports.count = function (data, response) {
  // Retrieve the number of locations.

  var valid = validateCount(data);

  if (!valid) {
    return response(errors.responses.InvalidRequestError);
  }

  handleToken(data.token, response, function () {
    model.count(db.get(), function (err, num) {
      if (err) {
        console.error(err);
        return response(errors.responses.DatabaseError);
      }
      return response({ success: num });
    });
  });
};

exports.getMarkersWithin = function (data, response) {
  // Parameters:
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
  //     Socket.io response function
  //
  // Response on success:
  //   {
  //     locations: arrayOfMarkerLocations
  //   }
  //
  // Each MarkerLocation has following properties
  //   _id
  //     string
  //   name
  //     string
  //   geom
  //     GeoJSON point
  //   tags
  //     array of strings
  //   layer
  //     integer

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
      db: db.get(),
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
