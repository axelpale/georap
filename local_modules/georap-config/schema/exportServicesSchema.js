module.exports = {
  type: 'array',
  items: {
    type: 'array',
    items: [
      {
        type: 'string',
      },
      {
        type: 'string',
      },
      {
        type: 'string',
      },
      {
        type: 'array',
        items: {
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
          },
          additionalProperties: false,
        },
      },
    ],
    additionalItems: false,
  },
};
