/* eslint-disable no-magic-numbers, no-sync */

var local = require('../../config/local');
var bcrypt = require('bcryptjs');
var ObjectId = require('mongodb').ObjectId;

var id = function (k) {
  return new ObjectId(k);
};

var luznaId = id('581f266110a1482dd0b7cd14');
var rummuId = id('581f166130a1482dd0b7cd15');
var irbeneId = id('581f166110a1482dd0b7cd13');

var luznaBaby = 'rkVdAtjYg';
var rummuBaby = 'ByX6eQoYe';
var irbeneBaby = 'SkdplmsFx';

var luznaName = 'Luzna';
var rummuName = 'Rummu';
var irbeneName = 'Irbene';

module.exports = {
  collections: {
    config: [
      {
        _id: id('58092312bbba430a35fb4139'),
        key: 'schemaVersion',
        value: 5,
      },
    ],
    entries: [
      {
        _id: id('58092312bbba420a35fb4201'),
        deleted: false,
        locationId: irbeneId,
        time: '2009-09-04T23:44:21.000Z',
        type: 'location_story',
        user: local.admin.username,
        data: {
          markdown: 'It is a soviet union ghost town.',
        },
      },
      {
        _id: id('58092312bebc430a35fb4102'),
        deleted: false,
        locationId: irbeneId,
        type: 'location_attachment',
        time: '2009-10-05T12:23:34.000Z',
        user: local.admin.username,
        data: {
          filepath: '2009/RxRvKSlbl/radar.jpg',
          mimetype: 'image/jpeg',
          thumbpath: '2009/RxRvKSlbl/radar_medium.jpg',
          thumbmimetype: 'image/jpeg',
        },
      },
    ],
    events: [
      {
        _id: id('58092332bcba430a35fb2345'),
        locationId: luznaId,
        locationName: luznaBaby,
        type: 'location_name_changed',
        user: local.admin.username,
        time: '2017-02-22T22:40:30.000Z',
        data: {
          oldName: luznaBaby,
          newName: luznaName,
        },
      },
      {
        _id: id('58092332bcba430a35fb3423'),
        locationId: luznaId,
        locationName: luznaBaby,
        type: 'location_created',
        user: local.admin.username,
        time: '2017-02-22T22:18:00.000Z',
        data: {
          lat: 57.59686,
          lng: 21.89747,
        },
      },
      {
        _id: id('58092332bcba430a35fb4105'),
        locationId: rummuId,
        locationName: rummuName,
        type: 'location_removed',
        user: local.admin.username,
        time: '2017-02-06T12:25:00.000Z',
        data: {},
      },
      {
        _id: id('58092312bcba430a35fb4104'),
        locationId: rummuId,
        locationName: rummuBaby,
        type: 'location_name_changed',
        user: local.admin.username,
        time: '2017-02-06T12:24:00.000Z',
        data: {
          oldName: rummuBaby,
          newName: rummuName,
        },
      },
      {
        _id: id('58092312bbba430a35fb4103'),
        locationId: rummuId,
        locationName: rummuBaby,
        type: 'location_created',
        user: local.admin.username,
        time: '2017-02-06T12:23:34.000Z',
        data: {
          lat: 59.22667,
          lng: 24.19462,
        },
      },
      {
        _id: id('58092312bbba430a35fb4102'),
        locationId: irbeneId,
        locationName: irbeneName,
        type: 'location_attachment_created',
        user: local.admin.username,
        time: '2009-10-05T12:23:34.000Z',
        data: {
          filepath: '2009/RxRvKSlbl/radar.jpg',
          mimetype: 'image/jpeg',
          thumbpath: '2009/RxRvKSlbl/radar_medium.jpg',
          thumbmimetype: 'image/jpeg',
        },
      },
      {
        _id: id('58092312bbba430a35fb4101'),
        locationId: irbeneId,
        locationName: irbeneName,
        type: 'location_story_created',
        user: local.admin.username,
        time: '2009-09-04T23:44:21.000Z',
        data: {
          markdown: 'It is a soviet union ghost town.',
        },
      },
      {
        _id: id('58092312bcba430a35fb3106'),
        locationId: irbeneId,
        locationName: irbeneBaby,
        type: 'location_name_changed',
        user: local.admin.username,
        time: '2009-07-30T10:45:20.000Z',
        data: {
          oldName: irbeneBaby,
          newName: irbeneName,
        },
      },
      {
        _id: id('58092312bbba430a35fb4100'),
        locationId: irbeneId,
        locationName: irbeneBaby,
        type: 'location_created',
        user: local.admin.username,
        time: '2009-07-30T10:44:58.000Z',
        data: {
          lat: 57.55341,
          lng: 21.857705,
        },
      },
    ],
    locations: [
      {
        _id: luznaId,
        creator: local.admin.username,
        name: luznaName,
        geom: {
          type: 'Point',
          coordinates: [21.89747, 57.59686],
        },
        deleted: false,
        tags: ['military'],
        layer: 9,
      },
      {
        _id: irbeneId,
        creator: local.admin.username,
        name: irbeneName,
        geom: {
          type: 'Point',
          coordinates: [21.857705, 57.55341],
        },
        deleted: false,
        tags: ['walk-in', 'town'],
        layer: 1,
      },
      {
        _id: rummuId,
        creator: local.admin.username,
        name: rummuName,
        geom: {
          type: 'Point',
          coordinates: [24.19462, 59.22667],
        },
        deleted: true,
        tags: [],
        layer: 2,
      },
    ],
    users: [
      {
        _id: id('5867bdf00a5a9e18d7755e4f'),
        name: local.admin.username,
        email: local.admin.email,
        hash: bcrypt.hashSync(local.admin.password, local.bcrypt.rounds),
        admin: true,
      },
      {
        _id: id('5867bdf00b5a9e18d7755e33'),
        name: 'johndoe',
        email: 'john.doe@subterranea.fi',
        hash: bcrypt.hashSync('foobar', local.bcrypt.rounds),
        admin: false,
      },
    ],
  },
  indices: [
    {
      collection: 'entries',
      spec: { locationId: 1 },
      options: {},
    },
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
    {
      collection: 'locations',
      spec: { layer: 1 },
      options: {},
    },
    {
      collection: 'users',
      spec: { email: 1 },
      options: { unique: true },
    },
    {
      collection: 'users',
      spec: { name: 1 },
      options: { unique: true },
    },
  ],
};
