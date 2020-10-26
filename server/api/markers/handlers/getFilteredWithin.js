var dal = require('../dal');
var status = require('http-status-codes');
var Ajv = require('ajv');

// Schema validator
var ajv = new Ajv({
  coerceTypes: true,
  useDefaults: true,
});

var schemaFilteredWithin = {
  type: 'object',
  properties: {
    east: {
      type: 'number',
    },
    north: {
      type: 'number',
    },
    south: {
      type: 'number',
    },
    west: {
      type: 'number',
    },
    type: {
      type: 'string',
    },
    layer: {
      type: 'integer',
    },
    gridWidth: {
      type: 'integer',
    },
    gridHeight: {
      type: 'integer',
    },
  },
  additionalProperties: false,
};
var validateFilteredWithin = ajv.compile(schemaFilteredWithin);

module.exports = function (req, res, next) {
  // Validate the request to prevent injection.
  // Data types are coerced, thus req.query is modified.
  if (!validateFilteredWithin(req.query)) {
    // DEBUG console.log('ERROR', validateQuery.errors);
    return res.sendStatus(status.BAD_REQUEST);
  }

  dal.getFilteredWithin({
    bounds: {
      east: req.query.east,
      north: req.query.north,
      south: req.query.south,
      west: req.query.west,
    },
    type: req.query.type,
    layer: req.query.layer,
    gridSize: {
      width: req.query.gridWidth,
      height: req.query.gridHeight,
    },
  }, function (err, markers) {
    if (err) {
      return next(err);
    }
    return res.json(markers);
  });
};
