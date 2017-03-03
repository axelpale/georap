/* eslint-disable max-lines, camelcase, no-magic-numbers */

var local = require('../../config/local');
var bcrypt = require('bcryptjs');
var ObjectId = require('mongodb').ObjectId;

// eslint-disable-next-line no-sync
var PASSWORD = bcrypt.hashSync('admin_password', local.bcrypt.rounds);

var id = function (k) {
  return new ObjectId(k);
};

var irbeneId = id('581f166110a1482dd0b7cd13');

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
        hash: PASSWORD,
        admin: true,
      }],
      locations: [{
        _id: irbeneId,
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

  'v6': {
    collections: {

      config: [{
        key: 'schemaVersion',
        value: 6,  // new
      }],

      entries: [{  // new
        _id: id('581f166110a1482dd0b7ea01'),
        data: {
          isVisit: false,
          markdown: 'A ghost town',
          filepath: null,
          mimetype: null,
          thumbfilepath: null,
          thumbmimetype: null,
        },
        deleted: false,
        locationId: irbeneId,
        time: '2009-09-04T23:44:21.000Z',
        type: 'location_entry',
        user: 'admin',
      }, {
        _id: id('581f166110a1482dd0b7ea02'),
        data: {
          isVisit: false,
          markdown: null,
          filepath: '2009/RxRvKSlbl/radar.jpg',  // the sample contains this
          mimetype: 'image/jpeg',
          thumbfilepath: '2009/RxRvKSlbl/radar_medium.jpg',
          thumbmimetype: 'image/jpeg',
        },
        deleted: false,
        locationId: irbeneId,
        time: '2009-10-02T11:11:01.000Z',
        type: 'location_entry',
        user: 'admin',
      }],

      events: [{  // new
        data: {
          lng: 21.857705,
          lat: 57.55341,
        },
        locationId: irbeneId,
        locationName: 'Aebej323',
        time: '2009-07-30T10:44:57.000Z',  // note -1 second shift
        type: 'location_created',
        user: 'admin',
      }, {
        data: {
          entryId: id('581f166110a1482dd0b7ea01'),
          isVisit: false,
          markdown: 'A ghost town',
          filepath: null,
          mimetype: null,
          thumbfilepath: null,
          thumbmimetype: null,
        },
        locationId: irbeneId,
        locationName: 'Irbene',
        time: '2009-09-04T23:44:21.000Z',
        type: 'location_entry_created',
        user: 'admin',
      }, {
        data: {
          entryId: id('581f166110a1482dd0b7ea02'),
          isVisit: false,
          markdown: null,
          filepath: '2009/RxRvKSlbl/radar.jpg',  // the sample contains this
          mimetype: 'image/jpeg',
          thumbfilepath: '2009/RxRvKSlbl/radar_medium.jpg',
          thumbmimetype: 'image/jpeg',
        },
        locationId: irbeneId,
        locationName: 'Irbene',
        time: '2009-10-02T11:11:01.000Z',
        type: 'location_entry_created',
        user: 'admin',
      }],

      users: [{
        admin: true,
        email: 'admin@example.com',
        hash: PASSWORD,
        name: 'admin',
        points: 0,  // new
      }],

      locations: [{
        _id: irbeneId,
        creator: 'admin',  // new
        deleted: false,
        geom: {
          type: 'Point',
          coordinates: [21.857705, 57.55341],
        },
        layer: 12,
        name: 'Irbene',
        // places should really be:
        // ['Irbene', 'Ances pagasts', 'Ventspils Municipality', 'Latvia']
        // but we cannot run reverse geocoding for each location.
        places: [],
        tags: ['walk-in'],
      }],
    },
  },

};
