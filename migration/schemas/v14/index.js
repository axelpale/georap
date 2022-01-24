const collections = require('./collections');
const indices = require('../v12/indices');

exports.fixture = {
  type: 'object',
  properties: {
    collections: collections,
    indices: indices,
  },
  required: [],
  additionalProperties: false,
};
