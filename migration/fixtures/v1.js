// NOTE This file documents the data structure of v1.

const c = require('./common');

module.exports = {
  collections: {
    config: [], // Denotes that collection doesn't exist and must be removed.
    users: [{
      name: 'admin',
      email: 'admin@example.com',
      hash: c.PASSWORD,
      admin: true,
    }],
    locations: [{
      name: 'Irbene',
      lat: 57.55341,
      lng: 21.857705,
      locator_id: 604, // eslint-disable-line camelcase
    }],
  },
};
