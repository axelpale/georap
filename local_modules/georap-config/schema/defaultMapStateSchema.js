module.exports = {
  type: 'object',
  properties: {
    lat: {
      type: 'number',
    },
    lng: {
      type: 'number',
    },
    zoom: {
      type: 'integer',
    },
    mapTypeId: {
      type: 'string',
      enum: ['roadmap', 'satellite', 'hybrid', 'terrain'],
    },
  },
  required: ['lat', 'lng', 'zoom', 'mapTypeId'],
  additionalProperties: false,
};
