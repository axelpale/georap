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
    email: {
      type: 'string',
      format: 'email',
    },
    hash: {
      type: 'string',
    },
    loginAt: time,
    name: {
      type: 'string',
    },
    points: {
      type: 'integer',
    },
    role: {
      type: 'string',
      // values depend on configuration
    },
    securityToken: {
      type: 'string',
    },
  },
  required: [
    // '_id', // not in fixtures
    'createdAt',
    'deleted',
    'email',
    'hash',
    'loginAt',
    'name',
    // 'points', // latent
    'role',
    'securityToken',
  ],
  additionalProperties: false,
};
