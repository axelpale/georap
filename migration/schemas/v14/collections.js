const location = require('./location');
const user = require('./user');

module.exports = {
  type: 'object',
  properties: {
    attachments: {
      type: 'array',
    },
    config: {
      type: 'array',
    },
    entries: {
      type: 'array',
    },
    events: {
      type: 'array',
    },
    locations: {
      type: 'array',
      items: location,
    },
    users: {
      type: 'array',
      items: user,
    },
  },
  required: [
    'attachments',
    'config',
    'entries',
    'events',
    'locations',
    'users',
  ],
  additionalProperties: false,
};
