const collections = require('./collections');
const indices = require('./indices');

exports.fixture = {
  type: 'object',
  properties: {
    collections: collections,
    indices: indices,
  },
  required: [],
  additionalProperties: false,
};

exports.location = require('./location');
