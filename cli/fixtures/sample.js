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
        clientGeneratedId: 'rkblRPFrg',
        type: 'location_created',
        locationId: new ObjectId('581f166110a1482dd0b7cd13'),
        user: local.admin.username,
        time: '2009-07-30T10:44:58.000Z',
        data: {},
      },
      {
        _id: new ObjectId('58092312bbba430a35fb4101'),
        clientGeneratedId: 'rkMxRvKSl',
        type: 'location_story_created',
        locationId: new ObjectId('581f166110a1482dd0b7cd13'),
        user: local.admin.username,
        time: '2009-09-04T23:44:21.000Z',
        data: {
          markdown: 'A ghost town',
        },
      },
      {
        _id: new ObjectId('58092312bbba430a35fb4102'),
        clientGeneratedId: 'RxRvKSlbl',
        type: 'location_attachment_created',
        locationId: new ObjectId('581f166110a1482dd0b7cd13'),
        user: local.admin.username,
        time: '2009-10-05T12:23:34.000Z',
        data: {
          filepath: '2009/RxRvKSlbl/radar.jpg',
          mimetype: 'image/jpeg',
        },
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
        content: [{
          _id: 'rkblRPFrg',
          type: 'created',
          user: local.admin.username,
          time: '2009-07-30T10:44:58.000Z',
          data: {},
        }, {
          _id: 'rkMxRvKSl',
          type: 'story',
          user: local.admin.username,
          time: '2009-09-04T23:44:21.000Z',
          data: {
            markdown: 'A ghost town',
          },
        }, {
          _id: 'RxRvKSlbl',
          type: 'attachment',
          user: local.admin.username,
          time: '2009-10-05T12:23:34.000Z',
          data: {
            filepath: '2009/RxRvKSlbl/radar.jpg',
            mimetype: 'image/jpeg',
          },
        }],
        layer: 1,
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
