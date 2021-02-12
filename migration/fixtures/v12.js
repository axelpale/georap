/* eslint-disable no-magic-numbers */
// NOTE This file is an important documentation of the data structure at v12.
// NOTE The properties changed from the prev version are marked with NOTE

var c = require('./common');
var db = require('tresdb-db');

module.exports = {
  collections: {

    config: [{
      key: 'schemaVersion',
      value: 12, // NOTE
    }],

    // NOTE New collection
    attachments: [
      {
        key: 'ewdsf3kk',
        user: 'admin',
        time: '2009-09-04T23:44:21.000Z',
        filepath: '2009/RxRvKSlbl/radar.jpg', // the uploads/ contains this...
        mimetype: 'image/jpeg',
        thumbfilepath: '2009/RxRvKSlbl/radar_medium.jpg', // ...and this.
        thumbmimetype: 'image/jpeg',
        deleted: false,
        data: {}, // optional additional data e.g. overlay positions
      },
      {
        key: 'adebd2rq',
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

    entries: [{
      _id: db.id('581f166110a1482dd0b7ea01'),
      attachments: [], // NOTE
      comments: [], // NOTE
      deleted: false,
      flags: [], // NOTE
      locationId: c.irbeneId,
      markdown: 'A ghost town', // NOTE
      published: false, // NOTE
      time: '2009-09-04T23:44:21.000Z',
      type: 'location_entry',
      user: 'admin',
      // NOTE possible entry.overlay moved to attachment.data.overlay
    }, {
      _id: db.id('581f166110a1482dd0b7ea02'),
      attachments: ['ewdsf3kk'], // NOTE
      comments: [
        {
          time: '2009-10-04T19:55:01.000Z',
          user: 'admin',
          message: 'Hello world',
          attachments: [], // NOTE
        },
        {
          time: '2021-02-10T20:30:01.000Z',
          user: 'admin',
          message: 'Tunnel ground',
          attachments: ['adebd2rq'], // NOTE
        },
      ],
      deleted: false,
      flags: ['visit'], // NOTE
      locationId: c.irbeneId,
      markdown: '', // NOTE null to ''
      published: false, // NOTE
      time: '2009-10-02T11:11:01.000Z',
      type: 'location_entry',
      user: 'admin',
    }],

    // No event _ids needed, they are created in run time.
    events: [{
      data: {
        lng: 21.857705,
        lat: 57.55341,
      },
      locationId: c.irbeneId,
      locationName: 'Irbene',
      time: '2009-07-30T10:44:57.000Z',
      type: 'location_created',
      user: 'admin',
    }, {
      data: {
        entryId: db.id('581f166110a1482dd0b7ea01'),
        markdown: 'A ghost town',
        created: true, // NOTE changed value
        // NOTE no need to list empty flags, comments or attachments
        // NOTE implicit published:false and deleted:false
      },
      locationId: c.irbeneId,
      locationName: 'Irbene',
      time: '2009-09-04T23:44:21.000Z',
      type: 'location_entry_created',
      user: 'admin',
    }, {
      data: {
        newTags: ['abandoned'],
        oldTags: [],
      },
      locationId: c.irbeneId,
      locationName: 'Irbene',
      time: '2009-09-04T23:45:20.000Z',
      type: 'location_tags_changed', // legacy event type
      user: 'admin',
    }, {
      data: {
        entryId: db.id('581f166110a1482dd0b7ea02'),
        created: true, // NOTE
        markdown: '', // NOTE null to ''
        attachments: ['ewdsf3kk'], // NOTE ref to attachment key
        // NOTE isVisit:false converted to implicit flags:[]
      },
      locationId: c.irbeneId,
      locationName: 'Irbene',
      time: '2009-10-02T11:11:01.000Z',
      type: 'location_entry_created',
      user: 'admin',
    }, {
      data: {
        entryId: db.id('581f166110a1482dd0b7ea02'),
        message: 'Dang radar, dude',
        // NOTE no change but implicit attachments:[]
      },
      locationId: c.irbeneId,
      locationName: 'Irbene',
      time: '2009-10-04T19:55:01.000Z',
      type: 'location_entry_comment_created',
      user: 'admin',
    }],

    users: [{
      admin: true,
      email: 'admin@example.com',
      hash: c.PASSWORD,
      name: 'admin',
      points: 0,
      // points7days: created by worker
      // points30days: created by worker
      status: 'active',
      createdAt: '2009-07-29T12:34:56.000Z', // NOTE
      loginAt: '2009-10-05T12:34:56.000Z', // NOTE
    }],

    locations: [{
      _id: c.irbeneId,
      creator: 'admin',
      deleted: false,
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
      visits: [],
      text1: '',
      text2: '',
    }],
  },
};
