const geom = require('./geom');
const time = require('./time');
const objectid = require('./objectid');

module.exports = {
  type: 'object',
  properties: {
    _id: objectid,
    createdAt: time,
    creator: {
      type: 'string',
    },
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
      // TODO enum
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
    // _id
    'createdAt',
    'creator',
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
    // childLayer
    // isLayered
    // layer
    // points
  ],
  additionalProperties: false,
};
