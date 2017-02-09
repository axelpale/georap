/* eslint-disable no-magic-numbers, no-sync */

var local = require('../../config/local');
var bcrypt = require('bcryptjs');
var ObjectId = require('mongodb').ObjectId;

module.exports = {
  collections: {
    config: [
      {
        _id: new ObjectId('58092312bbba430a35fb4139'),
        key: 'schemaVersion',
        value: 5,
      },
    ],
    events: [
      {
        _id: new ObjectId('58092312bbba430a35fb4100'),
        locationId: new ObjectId('581f166110a1482dd0b7cd13'),
        type: 'location_created',
        user: local.admin.username,
        time: '2009-07-30T10:44:58.000Z',
        data: {
          lat: 57.55341,
          lng: 21.857705,
        },
      },
      {
        _id: new ObjectId('58092312bbba430a35fb4101'),
        locationId: new ObjectId('581f166110a1482dd0b7cd13'),
        type: 'location_story_created',
        user: local.admin.username,
        time: '2009-09-04T23:44:21.000Z',
        data: {
          markdown: 'A ghost town',
        },
      },
      {
        _id: new ObjectId('58092312bbba430a35fb4102'),
        locationId: new ObjectId('581f166110a1482dd0b7cd13'),
        type: 'location_attachment_created',
        user: local.admin.username,
        time: '2009-10-05T12:23:34.000Z',
        data: {
          filepath: '2009/RxRvKSlbl/radar.jpg',
          mimetype: 'image/jpeg',
        },
      },
      {
        _id: new ObjectId('58092312bbba430a35fb4103'),
        locationId: new ObjectId('581f166130a1482dd0b7cd15'),
        type: 'location_created',
        user: local.admin.username,
        time: '2017-02-06T12:23:34.000Z',
        data: {
          lat: 59.22667,
          lng: 24.19462,
        },
      },
      {
        _id: new ObjectId('58092312bcba430a35fb4104'),
        locationId: new ObjectId('581f166130a1482dd0b7cd15'),
        type: 'location_name_changed',
        user: local.admin.username,
        time: '2017-02-06T12:24:00.000Z',
        data: {
          oldName: '',
          newName: 'Rummu',
        },
      },
      {
        _id: new ObjectId('58092332bcba430a35fb4105'),
        locationId: new ObjectId('581f166130a1482dd0b7cd15'),
        type: 'location_removed',
        user: local.admin.username,
        time: '2017-02-06T12:25:00.000Z',
        data: {},
      },
    ],
    locations: [
      {
        _id: new ObjectId('581f166110a1482dd0b7cd13'),
        name: 'Irbene',
        geom: {
          type: 'Point',
          coordinates: [21.857705, 57.55341],
        },
        deleted: false,
        tags: ['walk-in'],
        content: [
          {
            _id: 'rkblRPFrg',
            type: 'created',
            user: local.admin.username,
            time: '2009-07-30T10:44:58.000Z',
            data: {
              lat: 57.55341,
              lng: 21.857705,
            },
          },
          {
            _id: 'rkMxRvKSl',
            type: 'story',
            user: local.admin.username,
            time: '2009-09-04T23:44:21.000Z',
            data: {
              markdown: 'A ghost town',
            },
          },
          {
            _id: 'RxRvKSlbl',
            type: 'attachment',
            user: local.admin.username,
            time: '2009-10-05T12:23:34.000Z',
            data: {
              filepath: '2009/RxRvKSlbl/radar.jpg',
              mimetype: 'image/jpeg',
            },
          },
        ],
        layer: 1,
      },
      {
        _id: new ObjectId('581f166130a1482dd0b7cd15'),
        name: 'Rummu',
        geom: {
          type: 'Point',
          coordinates: [24.19462, 59.22667],
        },
        deleted: true,
        tags: [],
        content: [],
        layer: 2,
      },
    ],
    users: [
      {
        _id: new ObjectId('5867bdf00a5a9e18d7755e4f'),
        name: local.admin.username,
        email: local.admin.email,
        hash: bcrypt.hashSync(local.admin.password, local.bcrypt.rounds),
        admin: true,
      },
      {
        _id: new ObjectId('5867bdf00b5a9e18d7755e33'),
        name: 'johndoe',
        email: 'john.doe@subterranea.fi',
        hash: bcrypt.hashSync('foobar', local.bcrypt.rounds),
        admin: false,
      },
    ],
  },
  indices: [
    {
      collection: 'events',
      spec: { time: 1 },
      options: {},
    },
    {
      collection: 'events',
      spec: { locationId: 1 },
      options: {},
    },
    {
      collection: 'locations',
      spec: { geom: '2dsphere' },
      options: {},
    },
  ],
};
