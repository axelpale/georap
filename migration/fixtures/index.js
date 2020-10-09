/* eslint-disable camelcase, no-magic-numbers, global-require */

var c = require('./common');

module.exports = {

  'v6': require('./v6'),
  'v7': require('./v7'),
  'v8': require('./v8'),
  'v9': require('./v9'),

  'v1': {
    collections: {
      config: [],  // Denotes that collection doesn't exist and must be removed.
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
        hash: c.PASSWORD,
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
        hash: c.PASSWORD,
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
        }, {
          type: 'attachment',
          user: 'admin',
          time: '2009-10-02T11:11:01.000Z',
          data: {
            filename: 'radar.jpg',
            key: 'RxRvKSlbl',
            mimetype: 'image/jpeg',
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
        hash: c.PASSWORD,
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
        }, {
          _id: 'Aebej325',
          type: 'attachment',
          user: 'admin',
          time: '2009-10-02T11:11:01.000Z',
          data: {
            filename: 'radar.jpg',
            key: 'RxRvKSlbl',
            mimetype: 'image/jpeg',
          },
        }],
        layer: 12,
      }],
    },
  },

  'v5': {
    collections: {
      config: [{
        key: 'schemaVersion',
        value: 5,
      }],
      entries: [],  // quick hax to clear entries for v6 tests
      events: [],  // quick hax to clear events for v6 tests
      users: [{
        name: 'admin',
        email: 'admin@example.com',
        hash: c.PASSWORD,
        admin: true,
      }],
      locations: [{
        _id: c.irbeneId,
        name: 'Irbene',
        geom: {
          type: 'Point',
          coordinates: [21.857705, 57.55341],
        },
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
        }, {
          _id: 'Aebej325',
          type: 'attachment',
          user: 'admin',
          time: '2009-10-02T11:11:01.000Z',
          data: {
            filepath: '2009/RxRvKSlbl/radar.jpg',
            mimetype: 'image/jpeg',
          },
        }],
        layer: 12,
      }],
    },
  },
};
