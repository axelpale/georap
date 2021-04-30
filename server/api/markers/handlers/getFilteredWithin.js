const dal = require('../dal');
const status = require('http-status-codes');
const Ajv = require('ajv');
const config = require('georap-config');

// Schema validator
const ajv = new Ajv({
  coerceTypes: true,
  useDefaults: true,
});

const schemaFilteredWithin = {
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
    status: {
      type: 'string',
      enum: config.locationStatuses.concat(['any']),
    },
    type: {
      type: 'string',
      enum: config.locationTypes.concat(['any']),
    },
    layer: {
      type: 'integer',
    },
    groupRadius: {
      type: 'number',
    },
  },
  additionalProperties: false,
};
const validateFilteredWithin = ajv.compile(schemaFilteredWithin);

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
    status: req.query.status,
    type: req.query.type,
    layer: req.query.layer,
    groupRadius: req.query.groupRadius,
  }, (err, markers) => {
    if (err) {
      return next(err);
    }
    return res.json(markers);
  });
};
