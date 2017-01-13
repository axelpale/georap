var geom = require('./geom');
var entry = require('./entry');

module.exports = {
  type: 'object',
  required: [
    'content',
    'deleted',
    'geom',
    'name',
    'tags',
    'layer',
  ],
  properties: {
    _id: {
      type: 'string',
    },
    content: {
      type: 'array',
      items: entry,
    },
    deleted: {
      type: 'boolean',
    },
    geom: geom,
    name: {
      type: 'string',
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    layer: {
      type: 'integer',
    },
  },
};
