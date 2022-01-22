/* eslint-disable no-sync, max-lines */

// A database fixture that follows the latest schema.
// The fixture is aimed to be used as a demo and for experimenting
// in development.
//
// Dev note: Why to have the example fixture and a separate versioned fixture?
// Although the example fixture is a bit tedious to migrate, it is still
// the most complete representation of the available data structures.
// Also, it is easy to modify without burden of migration consistency.
// Also, here user credentials are loaded from config/index instead of
// test-specific literals.
// Also, the dev does not need to write change notes unlike in the versions.
//

const config = require('georap-config');
const db = require('georap-db');
const bcrypt = require('bcryptjs');
const common = require('./common');

const NOW = (new Date()).toISOString();

const admin = config.admin.username;

const luznaId = db.id('581f266110a1482dd0b7cd14');
const rummuId = db.id('581f166130a1482dd0b7cd15');
const irbeneId = common.irbeneId;

// Temporary names of locations before they are titled
const luznaBaby = 'rkVdAtjYg';
const rummuBaby = 'ByX6eQoYe';
const irbeneBaby = 'SkdplmsFx';
// Location titles
const luznaName = 'Luzna';
const rummuName = 'Rummu';
const irbeneName = 'Irbene';
// Duplicated content
const irbeneInfo = 'It is a soviet union ghost town.';

module.exports = {
  collections: {
    config: [
      {
        _id: db.id('58092312bbba430a35fb4139'),
        key: 'schemaVersion',
        value: 14,
      },
    ],
    attachments: [
      {
        key: 'ewdsf3s',
        user: 'admin',
        time: '2009-09-04T23:44:21.000Z',
        filename: 'radar.jpg',
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
        filename: 'tunnel-ground.jpg',
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
        activeAt: '2009-09-04T23:44:21.000Z',
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
        activeAt: '2009-10-05T12:23:34.000Z',
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
            activeAt: '2009-09-04T23:44:21.000Z',
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
            activeAt: '2009-10-05T12:23:34.000Z',
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
        createdAt: '2009-07-30T10:44:58.000Z',
        user: admin,
        deleted: false,
        geom: {
          type: 'Point',
          coordinates: [21.857705, 57.55341],
        },
        name: irbeneName,
        places: ['Irbene', 'Ances pagasts', 'Ventspils Municipality', 'Latvia'],
        published: false,
        status: 'abandoned',
        text1: '',
        text2: '',
        thumbnail: 'ewdsf3s',
        type: 'town',
        // Latent properties, updated by worker:
        points: 18,
        layer: 1,
        childLayer: 9,
        isLayered: true,
      },
      {
        // A location close to the first one.
        _id: luznaId,
        createdAt: '2017-02-22T22:18:00.000Z',
        user: admin,
        deleted: false,
        geom: {
          type: 'Point',
          coordinates: [21.89747, 57.59686],
        },
        name: luznaName,
        places: ['Tārgale parish', 'Ventspils Municipality', 'Latvia'],
        published: false,
        status: 'unknown',
        text1: '',
        text2: '',
        thumbnail: null,
        type: 'military',
        // Latent properties, updated by worker:
        points: 11,
        layer: 9,
        childLayer: 0,
        isLayered: true,
      },
      {
        // A deleted location
        _id: rummuId,
        createdAt: '2017-02-06T12:23:34.000Z',
        user: admin,
        deleted: true,
        geom: {
          type: 'Point',
          coordinates: [24.19462, 59.22667],
        },
        name: rummuName,
        places: ['Rummu', 'Vasalemma Parish', 'Harju County', 'Estonia'],
        published: false,
        status: 'unknown',
        text1: '',
        text2: '',
        thumbnail: null,
        type: 'default',
        // Latent properties, updated by worker:
        layer: 2,
        childLayer: 0,
        isLayered: false,
      },
    ],
    users: [
      {
        _id: db.id('5867bdf00a5a9e18d7755e4f'),
        email: config.admin.email,
        hash: bcrypt.hashSync(config.admin.password, config.bcrypt.rounds),
        name: admin,
        points: 0,  // points are updated by worker
        // points7days: to be created by worker
        // points30days: to be created by worker
        // points365days: to be created by worker
        role: 'admin',
        status: 'active',
        securityToken: '',
        deleted: false,
        createdAt: NOW,
        loginAt: NOW,
      },
      {
        _id: db.id('5867bdf00b5a9e18d7755e33'),
        email: 'john.doe@georap.fi',
        hash: bcrypt.hashSync('foobar', config.bcrypt.rounds),
        name: 'johndoe',
        points: 0,
        role: 'basic',
        status: 'deactivated',
        securityToken: '',
        deleted: false,
        createdAt: NOW,
        loginAt: NOW,
      },
    ],
  },
  indices: db.INDICES,
};
