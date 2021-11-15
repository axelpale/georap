module.exports = {
  type: 'object',
  properties: {
    host: {
      type: 'string',
      format: 'hostname',
    },
    port: {
      type: 'integer',
    },
    secure: {
      type: 'boolean',
    },
    auth: {
      type: 'object',
      properties: {
        user: {
          type: 'string',
        },
        pass: {
          type: 'string',
        },
      },
    },
  },
};
