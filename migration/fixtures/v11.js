/* eslint-disable no-magic-numbers */
// NOTE This file is an important documentation of the data structure at v11.
// NOTE Changed properties are marked with NOTE

var c = require('./common');
var db = require('tresdb-db');

module.exports = {
  collections: {

    config: [{
      key: 'schemaVersion',
      value: 11, // NOTE
    }],

    entries: [
      {
        _id: db.id('581f166110a1482dd0b7ea01'),
        data: {
          isVisit: false,
          markdown: 'A ghost town',
          filepath: null,
          mimetype: null,
          thumbfilepath: null,
          thumbmimetype: null,
        },
        deleted: false,
        locationId: c.irbeneId,
        time: '2009-09-04T23:44:21.000Z',
        type: 'location_entry',
        user: 'admin',
        // NOTE in v11 we allow missing comments prop.
        // NOTE In v12 the comments prop is required.
      },
      {
        _id: c.locatorEntryId,
        comments: [
          {
            time: '2009-10-04T19:55:01.000Z',
            user: 'admin',
            message: 'Hello world',
          },
          {
            time: '2021-02-10T20:30:01.000Z',
            user: 'admin',
            message: 'Tunnel ground',
            attachments: ['adebd2rq'], // NOTE not v11 but prefilled v12
          },
        ],
        data: {
          isVisit: true, // NOTE changed by location_entry_changed
          markdown: 'Ventspils RT-32 radio telescope', // NOTE changed by ev
          filepath: '2009/RxRvKSlbl/radar.jpg', // the sample contains this
          mimetype: 'image/jpeg',
          thumbfilepath: '2009/RxRvKSlbl/radar_medium.jpg',
          thumbmimetype: 'image/jpeg',
          overlay: {}, // NOTE mimic failed overlay to ensure removal in v11v12
        },
        deleted: false,
        locationId: c.irbeneId,
        time: '2009-10-02T11:11:01.000Z',
        type: 'location_entry',
        user: 'admin',
      },
    ],

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
          isVisit: false,
          markdown: 'A ghost town',
          filepath: null,
          mimetype: null,
          thumbfilepath: null,
          thumbmimetype: null,
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
          isVisit: false,
          markdown: null,
          filepath: '2009/RxRvKSlbl/radar.jpg', // the sample contains this
          mimetype: 'image/jpeg',
          thumbfilepath: '2009/RxRvKSlbl/radar_medium.jpg',
          thumbmimetype: 'image/jpeg',
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
          message: 'Dang radar, dude',
        },
        locationId: c.irbeneId,
        locationName: 'Irbene',
        time: '2009-10-04T19:55:01.000Z',
        type: 'location_entry_comment_created',
        user: 'admin',
      },
      { // NOTE added location_entry_changed ev for docs and v11v12 migr.
        _id: db.id('581f166110a1482dd038f33a'),
        type: 'location_entry_changed',
        user: 'admin',
        time: '2017-06-29T18:44:21.194Z',
        locationId: c.irbeneId,
        locationName: 'Irbene',
        data: {
          entryId: c.locatorEntryId,
          oldMarkdown: null,
          newMarkdown: 'Ventspils RT-32 radio telescope',
          oldIsVisit: false,
          newIsVisit: true,
          oldFilepath: '2009/RxRvKSlbl/radar.jpg',
          newFilepath: '2009/RxRvKSlbl/radar.jpg',
          oldMimetype: 'image/jpeg',
          newMimetype: 'image/jpeg',
          oldThumbfilepath: '2009/RxRvKSlbl/radar_medium.jpg',
          newThumbfilepath: '2009/RxRvKSlbl/radar_medium.jpg',
          oldThumbmimetype: 'image/jpeg',
          newThumbmimetype: 'image/jpeg',
        },
      },
      // NOTE an entry create-remove pair to test removal of these orphans
      {
        _id: db.id('581f166110a1482dd577fbba'),
        type: 'location_entry_created',
        user: 'admin',
        time: '2021-02-15T22:16:10.000Z',
        locationId: c.irbeneId,
        locationName: 'Irbene',
        data: {
          entryId: db.id('d784ee5136f59eb3dda9c79e'),
          isVisit: false,
          markdown: 'Something not so relevant',
          filepath: null,
          mimetype: null,
          thumbfilepath: null,
          thumbmimetype: null,
        },
      },
      {
        _id: db.id('581f166110a1482dd577fbbb'),
        type: 'location_entry_removed',
        user: 'admin',
        time: '2021-02-15T22:18:13.000Z',
        locationId: c.irbeneId,
        locationName: 'Irbene',
        data: {
          entryId: db.id('d784ee5136f59eb3dda9c79e'),
        },
      },
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
      // visits: [], new locations did not receive visits due to bug in v10
      text1: '',
      text2: '',
    }],
  },
};
