/* eslint-disable camelcase, no-magic-numbers */

var local = require('../../config/local');
var bcrypt = require('bcryptjs');

// eslint-disable-next-line no-sync
var PASSWORD = bcrypt.hashSync('admin_password', local.bcrypt.rounds);

module.exports = {

  'v1': {
    collections: {
      config: [],  // Denotes that collection doesn't exist and must be removed.
      users: [{
        name: 'admin',
        email: 'admin@example.com',
        hash: PASSWORD,
        admin: true,
      }],
      locations: [{
        name: 'Irbene',
        lat: 57.55341,
        lng: 21.857705,
        locator_id: 604,
      }],
    },
  },

  'v2': {
    collections: {
      config: [{
        key: 'schemaVersion',
        value: 2,
      }],
      users: [{
        name: 'admin',
        email: 'admin@example.com',
        hash: PASSWORD,
        admin: true,
      }],
      locations: [{
        name: 'Irbene',
        geom: {
          type: 'Point',
          coordinates: [21.857705, 57.55341],
        },
        locator_id: 604,
      }],
    },
  },

  'v3': {
    collections: {
      config: [{
        key: 'schemaVersion',
        value: 3,
      }],
      users: [{
        name: 'admin',
        email: 'admin@example.com',
        hash: PASSWORD,
        admin: true,
      }],
      locations: [{
        name: 'Irbene',
        geom: {
          type: 'Point',
          coordinates: [21.857705, 57.55341],
        },
        locatorId: 604,
        deleted: false,
        tags: ['walk-in'],
        content: [{
          type: 'created',
          user: 'admin',
          time: '2009-07-30T10:44:58.000Z',
          data: {},
        }, {
          type: 'story',
          user: 'admin',
          time: '2009-09-04T23:44:21.000Z',
          data: {
            markdown: 'A ghost town',
          },
        }],
        neighborsAvgDist: 42886.25362949583,
        layer: 12,
      }],
    },
  },

  'v4': {
    collections: {
      config: [{
        key: 'schemaVersion',
        value: 4,
      }],
      users: [{
        name: 'admin',
        email: 'admin@example.com',
        hash: PASSWORD,
        admin: true,
      }],
      locations: [{
        name: 'Irbene',
        geom: {
          type: 'Point',
          coordinates: [21.857705, 57.55341],
        },
        locatorId: 604,
        deleted: false,
        tags: ['walk-in'],
        content: [{
          _id: 'Aebej323',
          type: 'created',
          user: 'admin',
          time: '2009-07-30T10:44:58.000Z',
          data: {},
        }, {
          _id: 'Aebej324',
          type: 'story',
          user: 'admin',
          time: '2009-09-04T23:44:21.000Z',
          data: {
            markdown: 'A ghost town',
          },
        }],
        layer: 12,
      }],
    },
  },

};
