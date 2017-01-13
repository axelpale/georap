module.exports = {
  type: 'object',
  properties: {
    _id: {
      type: 'string',
    },
    time: {
      type: 'string',
      format: 'date-time',
    },
    type: {
      type: 'string',
      enum: [ 'attachment', 'created', 'rename', 'story', 'visit' ],
    },
    user: {
      type: 'string',
    },
    data: {
      type: 'object',
    },
  },
};
