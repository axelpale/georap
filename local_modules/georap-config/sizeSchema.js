module.exports = {
  type: 'object',
  properties: {
    width: {
      type: 'integer',
    },
    height: {
      type: 'integer',
    },
  },
  required: ['width', 'height'],
  additionalProperties: false,
};
