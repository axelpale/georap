/* eslint-disable no-magic-numbers, no-sync, max-lines */

// Latest v12 schema. Tedious to migrate, but is the most complete
// representation of the available data structures yet easy to modify
// without burden of migration consistency. Also here user credentials
// are loaded from config/index instead of test-specific literals.
// Also no need for change notes here.
//
// This fixture is aimed to be used as a demo and for experimenting
// in development.

var config = require('tresdb-config');
var db = require('tresdb-db');
var bcrypt = require('bcryptjs');
var common = require('./common');

var NOW = (new Date()).toISOString();

var admin = config.admin.username;

var luznaId = db.id('581f266110a1482dd0b7cd14');
var rummuId = db.id('581f166130a1482dd0b7cd15');
var irbeneId = common.irbeneId;

// Temporary names of locations before they are titled
var luznaBaby = 'rkVdAtjYg';
var rummuBaby = 'ByX6eQoYe';
var irbeneBaby = 'SkdplmsFx';
// Location titles
var luznaName = 'Luzna';
var rummuName = 'Rummu';
var irbeneName = 'Irbene';
// Duplicated content
var irbeneInfo = 'It is a soviet union ghost town.';

module.exports = {
  collections: {
    config: [
      {
        _id: db.id('58092312bbba430a35fb4139'),
        key: 'schemaVersion',
        value: 12,
      },
    ],
    attachments: [
      {
        key: 'ewdsf3s',
        user: 'admin',
        time: '2009-09-04T23:44:21.000Z',
        filepath: '2009/RxRvKSlbl/radar.jpg', // the uploads/ contains this...
        mimetype: 'image/jpeg',
        thumbfilepath: '2009/RxRvKSlbl/radar_medium.jpg', // ...and this.
        thumbmimetype: 'image/jpeg',
        deleted: false,
        data: {},
      },
      {
        key: 'adebd2r',
        user: 'admin',
        time: '2009-09-04T23:44:21.000Z',
        filepath: '2021/EdvjkeEdf/tunnel-ground.jpg', // see uploads/
        mimetype: 'image/jpeg', /// small pic = same image
        thumbfilepath: '2021/EdvjkeEdf/tunnel-ground.jpg',
        thumbmimetype: 'image/jpeg',
        deleted: false,
        data: {},
      },
    ],
    entries: [
      {
        // A brief description about location
        _id: db.id('58092312bbba420a35fb4201'),
        attachments: [],
        comments: [],
        deleted: false,
        flags: [],
        locationId: irbeneId,
        markdown: irbeneInfo,
        published: false,
        time: '2009-09-04T23:44:21.000Z',
        user: admin,
      },
      {
        // A visit with attachment
        _id: db.id('58092312bebc430a35fb4102'),
        attachments: ['ewdsf3s'],
        comments: [],
        deleted: false,
        flags: ['visit'],
        locationId: irbeneId,
        markdown: '',
        published: false,
        time: '2009-10-05T12:23:34.000Z',
        user: admin,
      },
    ],
    events: [
      // Chronological order; oldest event first
      {
        // Create a location.
        _id: db.id('58092312bbba430a35fb4100'),
        locationId: irbeneId,
        locationName: irbeneBaby,
        type: 'location_created',
        user: admin,
        time: '2009-07-30T10:44:58.000Z',
        data: {
          lat: 57.55341,
          lng: 21.857705,
        },
      },
      {
        // Rename the location.
        _id: db.id('58092312bcba430a35fb3106'),
        locationId: irbeneId,
        locationName: irbeneBaby,
        type: 'location_name_changed',
        user: admin,
        time: '2009-07-30T10:45:20.000Z',
        data: {
          oldName: irbeneBaby,
          newName: irbeneName,
        },
      },
      {
        // A description entry creation
        _id: db.id('58092312bbba430a35fb4101'),
        locationId: irbeneId,
        locationName: irbeneName,
        type: 'location_entry_created',
        user: admin,
        time: '2009-09-04T23:44:21.000Z',
        data: {
          entryId: db.id('58092312bbba420a35fb4201'),
          entry: {
            _id: db.id('58092312bbba420a35fb4201'),
            attachments: [],
            comments: [],
            deleted: false,
            flags: [],
            locationId: irbeneId,
            markdown: irbeneInfo,
            published: false,
            time: '2009-09-04T23:44:21.000Z',
            user: admin,
          },
        },
      },
      {
        // A visit entry creation
        _id: db.id('58092312bbba430a35fb4102'),
        locationId: irbeneId,
        locationName: irbeneName,
        type: 'location_entry_created',
        user: admin,
        time: '2009-10-05T12:23:34.000Z',
        data: {
          entryId: db.id('58092312bebc430a35fb4102'),
          entry: {
            _id: db.id('58092312bebc430a35fb4102'),
            locationId: irbeneId,
            time: '2009-10-05T12:23:34.000Z',
            user: admin,
            deleted: false,
            published: false,
            markdown: '',
            attachments: ['ewdsf3s'],
            comments: [],
            flags: ['visit'],
          },
        },
      },
      {
        // Another location to be deleted later.
        _id: db.id('58092312bbba430a35fb4103'),
        locationId: rummuId,
        locationName: rummuBaby,
        type: 'location_created',
        user: admin,
        time: '2017-02-06T12:23:34.000Z',
        data: {
          lat: 59.22667,
          lng: 24.19462,
        },
      },
      {
        // Rename
        _id: db.id('58092312bcba430a35fb4104'),
        locationId: rummuId,
        locationName: rummuBaby,
        type: 'location_name_changed',
        user: admin,
        time: '2017-02-06T12:24:00.000Z',
        data: {
          oldName: rummuBaby,
          newName: rummuName,
        },
      },
      {
        // Delete the location
        _id: db.id('58092332bcba430a35fb4105'),
        locationId: rummuId,
        locationName: rummuName,
        type: 'location_removed',
        time: '2017-02-06T12:25:00.000Z',
        user: admin,
        data: {},
      },
      {
        // Create third location close to the first.
        _id: db.id('58092332bcba430a35fb3423'),
        locationId: luznaId,
        locationName: luznaBaby,
        type: 'location_created',
        time: '2017-02-22T22:18:00.000Z',
        user: admin,
        data: {
          lat: 57.59686,
          lng: 21.89747,
        },
      },
      {
        // Rename it.
        _id: db.id('58092332bcba430a35fb2345'),
        locationId: luznaId,
        locationName: luznaBaby,
        type: 'location_name_changed',
        time: '2017-02-22T22:40:30.000Z',
        user: admin,
        data: {
          oldName: luznaBaby,
          newName: luznaName,
        },
      },
    ],
    locations: [
      {
        // A location in Latvia
        _id: irbeneId,
        creator: admin,
        name: irbeneName,
        geom: {
          type: 'Point',
          coordinates: [21.857705, 57.55341],
        },
        deleted: false,
        published: false,
        status: 'abandoned',
        type: 'town',
        text1: '',
        text2: '',
        places: ['Irbene', 'Ances pagasts', 'Ventspils Municipality', 'Latvia'],
        // Latent properties, updated by worker:
        points: 18,
        layer: 1,
        childLayer: 9,
        isLayered: true,
        visits: [],
      },
      {
        // A location close to the first one.
        _id: luznaId,
        creator: admin,
        name: luznaName,
        geom: {
          type: 'Point',
          coordinates: [21.89747, 57.59686],
        },
        deleted: false,
        published: false,
        status: 'unknown',
        type: 'military',
        text1: '',
        text2: '',
        places: ['Tārgale parish', 'Ventspils Municipality', 'Latvia'],
        // Latent properties, updated by worker:
        points: 11,
        layer: 9,
        childLayer: 0,
        isLayered: true,
        visits: [],
      },
      {
        // A deleted location
        _id: rummuId,
        creator: admin,
        name: rummuName,
        geom: {
          type: 'Point',
          coordinates: [24.19462, 59.22667],
        },
        deleted: true,
        published: [],
        status: 'unknown',
        type: 'default',
        text1: '',
        text2: '',
        places: ['Rummu', 'Vasalemma Parish', 'Harju County', 'Estonia'],
        // Latent properties, updated by worker:
        layer: 2,
        childLayer: 0,
        isLayered: false,
        visits: [],
      },
    ],
    users: [
      {
        _id: db.id('5867bdf00a5a9e18d7755e4f'),
        admin: true,
        email: config.admin.email,
        hash: bcrypt.hashSync(config.admin.password, config.bcrypt.rounds),
        name: admin,
        points: 0,  // points are updated by worker
        status: 'active',
        createdAt: NOW,
        loginAt: NOW,
      },
      {
        _id: db.id('5867bdf00b5a9e18d7755e33'),
        admin: false,
        email: 'john.doe@tresdb.fi',
        hash: bcrypt.hashSync('foobar', config.bcrypt.rounds),
        name: 'johndoe',
        points: 0,
        status: 'deactivated',
        createdAt: NOW,
        loginAt: NOW,
      },
    ],
  },
  indices: db.INDICES,
};
