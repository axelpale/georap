module.exports = {
  type: 'object',
  properties: {
    src: {
      type: 'string',
    },
    sizes: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
  },
  required: ['src', 'sizes', 'type'],
  additionalProperties: false,
};
