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
      },
      {
        _id: c.locatorEntryId,
        comments: [
          {
            time: '2009-10-04T19:55:01.000Z',
            user: 'admin',
            message: 'Hello world',
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
        type: "location_entry_changed",
        user: "admin",
        time: "2017-06-29T18:44:21.194Z",
        locationId: c.irbeneId,
        locationName: "Irbene",
        data: {
          entryId: c.locatorEntryId,
          oldMarkdown: null,
          newMarkdown: 'Ventspils RT-32 radio telescope',
          oldIsVisit: false,
          newIsVisit: true,
          oldFilepath: '2009/RxRvKSlbl/radar.jpg',
          newFilepath: 'image/jpeg',
          oldMimetype: '2009/RxRvKSlbl/radar_medium.jpg',
          newMimetype: 'image/jpeg',
          oldThumbfilepath: '2009/RxRvKSlbl/radar.jpg',
          newThumbfilepath: 'image/jpeg',
          oldThumbmimetype: '2009/RxRvKSlbl/radar_medium.jpg',
          newThumbmimetype: 'image/jpeg',
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
      visits: [],
      text1: '',
      text2: '',
    }],
  },
};
