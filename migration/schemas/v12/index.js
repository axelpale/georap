const collections = require('./collections');
const indices = require('./indices');

module.exports = {
  type: 'object',
  properties: {
    collections: collections,
    indices: indices,
  },
  required: [],
  additionalProperties: false,
};
