// NOTE This file documents of the database structure at the given version.
// NOTE The properties changed from the prev version are marked with NOTE

const c = require('./common');
const db = require('georap-db');

module.exports = {
  collections: {

    config: [{
      key: 'schemaVersion',
      value: 14, // NOTE
    }],

    attachments: [
      {
        key: 'ewdsf3kk',
        user: 'admin',
        time: '2009-09-04T23:44:21.000Z',
        filename: 'radar.jpg',
        filepath: '2009/RxRvKSlbl/radar.jpg', // the uploads/ contains this...
        mimetype: 'image/jpeg',
        filesize: 361485,
        thumbfilepath: '2009/RxRvKSlbl/radar_medium.jpg', // ...and this.
        thumbmimetype: 'image/jpeg',
        deleted: false,
        data: {}, // optional additional data e.g. overlay positions
      },
      {
        key: 'adebd2rq',
        user: 'admin',
        time: '2009-09-04T23:44:21.000Z',
        filename: 'tunnel-ground.jpg',
        filepath: '2021/EdvjkeEdf/tunnel-ground.jpg', // see uploads/
        mimetype: 'image/jpeg', /// small pic = same image
        filesize: 78397,
        thumbfilepath: '2021/EdvjkeEdf/tunnel-ground.jpg',
        thumbmimetype: 'image/jpeg',
        deleted: false,
        data: {},
      },
    ],

    entries: [{
      _id: db.id('581f166110a1482dd0b7ea01'),
      activeAt: '2009-09-04T23:44:21.000Z',
      attachments: [],
      comments: [],
      deleted: false,
      flags: [],
      locationId: c.irbeneId,
      markdown: 'A ghost town',
      published: false,
      time: '2009-09-04T23:44:21.000Z',
      user: 'admin',
    }, {
      _id: c.locatorEntryId,
      activeAt: '2021-02-10T20:30:01.000Z',
      attachments: ['ewdsf3kk'],
      comments: [
        {
          id: '200908007777756281648757',
          time: '2009-10-04T19:55:01.000Z',
          user: 'admin',
          markdown: 'Dang radar, dude',
          attachments: [],
        },
        {
          id: '202129864710097690580043',
          time: '2021-02-10T20:30:01.000Z',
          user: 'admin',
          markdown: 'Tunnel ground',
          attachments: ['adebd2rq'],
        },
      ],
      deleted: false,
      flags: ['visit'],
      locationId: c.irbeneId,
      markdown: 'Ventspils RT-32 radio telescope',
      published: false,
      time: '2009-10-02T11:11:01.000Z',
      user: 'admin',
    }],

    // No event _ids needed, they are created in run time.
    events: [
      {
        data: {
          lng: 21.857705,
          lat: 57.55341,
        },
        locationId: c.irbeneId,
        locationName: 'Irbene',
        time: '2009-07-30T10:44:57.000Z',
        type: 'location_created',
        user: 'admin',
      },
      {
        data: {
          entryId: db.id('581f166110a1482dd0b7ea01'),
          entry: {
            _id: db.id('581f166110a1482dd0b7ea01'),
            activeAt: '2009-09-04T23:44:21.000Z',
            attachments: [],
            comments: [],
            deleted: false,
            flags: [],
            locationId: c.irbeneId,
            markdown: 'A ghost town',
            published: false,
            time: '2009-09-04T23:44:21.000Z',
            user: 'admin',
          },
        },
        locationId: c.irbeneId,
        locationName: 'Irbene',
        time: '2009-09-04T23:44:21.000Z',
        type: 'location_entry_created',
        user: 'admin',
      },
      {
        data: {
          newTags: ['abandoned'],
          oldTags: [],
        },
        locationId: c.irbeneId,
        locationName: 'Irbene',
        time: '2009-09-04T23:45:20.000Z',
        type: 'location_tags_changed', // legacy event type
        user: 'admin',
      },
      {
        data: {
          entryId: c.locatorEntryId,
          entry: {
            _id: c.locatorEntryId,
            activeAt: '2009-10-02T11:11:01.000Z',
            locationId: c.irbeneId,
            time: '2009-10-02T11:11:01.000Z',
            user: 'admin',
            deleted: false,
            published: false,
            markdown: '',
            attachments: ['ewdsf3kk'],
            comments: [],
            flags: [],
          },
        },
        locationId: c.irbeneId,
        locationName: 'Irbene',
        time: '2009-10-02T11:11:01.000Z',
        type: 'location_entry_created',
        user: 'admin',
      },
      {
        data: {
          entryId: c.locatorEntryId,
          commentId: '200908007777756281648757',
          comment: {
            id: '200908007777756281648757',
            time: '2009-10-04T19:55:01.000Z',
            user: 'admin',
            markdown: 'Dang radar, dude',
            attachments: [],
          },
        },
        locationId: c.irbeneId,
        locationName: 'Irbene',
        time: '2009-10-04T19:55:01.000Z',
        type: 'location_entry_comment_created',
        user: 'admin',
      },
      {
        data: {
          entryId: c.locatorEntryId,
          commentId: '202129864710097690580043',
          comment: {
            id: '202129864710097690580043',
            time: '2021-02-10T20:30:01.000Z',
            user: 'admin',
            markdown: 'Tunnel ground',
            attachments: ['adebd2rq'],
          },
        },
        locationId: c.irbeneId,
        locationName: 'Irbene',
        time: '2021-02-10T20:30:01.000Z',
        type: 'location_entry_comment_created',
        user: 'admin',
      },
      {
        _id: db.id('581f166110a1482dd038f33a'),
        type: 'location_entry_changed',
        user: 'admin',
        time: '2017-06-29T18:44:21.194Z',
        locationId: c.irbeneId,
        locationName: 'Irbene',
        data: {
          entryId: c.locatorEntryId,
          original: {
            markdown: '',
            flags: [],
          },
          delta: {
            markdown: 'Ventspils RT-32 radio telescope',
            flags: ['visit'],
          },
        },
      },
    ],

    users: [{
      // admin: true, // NOTE deprecated in favor of 'role'
      email: 'admin@example.com',
      hash: c.PASSWORD,
      name: 'admin',
      points: 0,
      role: 'admin', // NOTE new in v14
      securityToken: '', // NOTE new in v14, a JWT token
      status: 'active',
      createdAt: '2009-07-29T12:34:56.000Z',
      loginAt: '2009-10-05T12:34:56.000Z',
      deleted: false, // NOTE new in v14
    }],

    locations: [{
      _id: c.irbeneId,
      createdAt: '2009-07-30T10:44:57.000Z',
      user: 'admin', // NOTE renamed in v14
      deleted: false,
      published: false,
      geom: {
        type: 'Point',
        coordinates: [21.857705, 57.55341],
      },
      layer: 12,
      childLayer: 0,
      isLayered: true,
      name: 'Irbene',
      points: 0,
      places: [],
      status: 'abandoned',
      type: 'default',
      thumbnail: 'ewdsf3kk',
      text1: '',
      text2: '',
    }],
  },
};
