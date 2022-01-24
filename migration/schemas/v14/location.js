const geom = require('../v12/geom');
const time = require('../v12/time');
const objectid = require('../v12/objectid');

module.exports = {
  type: 'object',
  properties: {
    _id: objectid,
    createdAt: time,
    deleted: {
      type: 'boolean',
    },
    geom: geom,
    name: {
      type: 'string',
    },
    places: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    published: {
      type: 'boolean',
    },
    status: {
      type: 'string',
      // values depend on configuration
    },
    text1: {
      type: 'string',
    },
    text2: {
      type: 'string',
    },
    thumbnail: {
      anyOf: [
        {
          type: 'string',
        },
        {
          type: 'null',
        },
      ],
    },
    type: {
      type: 'string',
    },
    user: {
      type: 'string',
    },
    // Latent
    childLayer: {
      type: 'integer',
    },
    isLayered: {
      type: 'boolean',
    },
    layer: {
      type: 'integer',
    },
    points: {
      type: 'integer',
    },
  },
  required: [
    // '_id', // not present in fixtures
    'createdAt',
    'deleted',
    'geom',
    'name',
    'places',
    'published',
    'status',
    'text1',
    'text2',
    'thumbnail',
    'type',
    'user',
    // 'childLayer', // latent
    // 'isLayered', // latent
    // 'layer', // latent
    // 'points', // latent
  ],
  additionalProperties: false,
};
