/* eslint-disable no-magic-numbers */
// NOTE This file documents the data structure of v2.

var c = require('./common');

module.exports = {
  collections: {
    config: [{
      key: 'schemaVersion',
      value: 2,
    }],
    users: [{
      name: 'admin',
      email: 'admin@example.com',
      hash: c.PASSWORD,
      admin: true,
    }],
    locations: [{
      name: 'Irbene',
      geom: {
        type: 'Point',
        coordinates: [21.857705, 57.55341],
      },
      locator_id: 604, // eslint-disable-line camelcase
    }],
  },
};
