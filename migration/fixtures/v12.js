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
      markdown: 'A ghost town', // NOTE outside data
      published: false, // NOTE
      time: '2009-09-04T23:44:21.000Z',
      user: 'admin',
      // NOTE type prop is dropped
    }, {
      _id: c.locatorEntryId,
      attachments: ['ewdsf3kk'], // NOTE
      comments: [
        {
          id: '200908007777756281648757',
          time: '2009-10-04T19:55:01.000Z',
          user: 'admin',
          markdown: 'Dang radar, dude',
          attachments: [], // NOTE
        },
        {
          id: '202129864710097690580043',
          time: '2021-02-10T20:30:01.000Z',
          user: 'admin',
          markdown: 'Tunnel ground',
          attachments: ['adebd2rq'], // NOTE
        },
      ],
      deleted: false,
      flags: ['visit'], // NOTE
      locationId: c.irbeneId,
      markdown: 'Ventspils RT-32 radio telescope', // NOTE null to '' by deflt
      published: false, // NOTE
      time: '2009-10-02T11:11:01.000Z',
      user: 'admin',
      // NOTE overlay prop is dropped
      // NOTE type prop is dropped
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
          entry: { // NOTE full entry
            _id: db.id('581f166110a1482dd0b7ea01'),
            attachments: [], // NOTE
            comments: [], // NOTE
            deleted: false,
            flags: [], // NOTE
            locationId: c.irbeneId,
            markdown: 'A ghost town', // NOTE outside data
            published: false, // NOTE
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
        data: { // NOTE
          entryId: c.locatorEntryId,
          entry: { // NOTE full entry state
            _id: c.locatorEntryId,
            locationId: c.irbeneId,
            time: '2009-10-02T11:11:01.000Z',
            user: 'admin',
            deleted: false,
            published: false,
            markdown: '',
            attachments: ['ewdsf3kk'], // NOTE ref to attachment key
            comments: [],
            flags: [], // NOTE isVisit:false converted to flags:[]
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
          comment: { // NOTE
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
          comment: { // NOTE
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
          original: { // NOTE original values of the changed
            markdown: '', // NOTE in v11 was null but in v12 is ''
            flags: [],
          },
          delta: { // NOTE new values of the changed
            markdown: 'Ventspils RT-32 radio telescope',
            flags: ['visit'],
          },
        },
      },
      // NOTE missing entry create-remove pair.
    ],

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
      visits: [],
      text1: '',
      text2: '',
    }],
  },
};
