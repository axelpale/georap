// NOTE This file is an important documentation of the data structure of v8.

const c = require('./common');
const db = require('georap-db');

module.exports = {
  collections: {

    config: [{
      key: 'schemaVersion',
      value: 8,  // new
    }],

    entries: [{
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
    }, {
      _id: db.id('581f166110a1482dd0b7ea02'),
      comments: [
        {
          time: '2009-10-04T19:55:01.000Z',
          user: 'admin',
          message: 'Hello world',
        },
      ],
      data: {
        isVisit: false,
        markdown: null,
        filepath: '2009/RxRvKSlbl/radar.jpg',  // the sample contains this
        mimetype: 'image/jpeg',
        thumbfilepath: '2009/RxRvKSlbl/radar_medium.jpg',
        thumbmimetype: 'image/jpeg',
      },
      deleted: false,
      locationId: c.irbeneId,
      time: '2009-10-02T11:11:01.000Z',
      type: 'location_entry',
      user: 'admin',
    }],

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
    }, {
      data: {
        newTags: ['walk-in'],
        oldTags: [],
      },
      locationId: c.irbeneId,
      locationName: 'Irbene',
      time: '2009-09-04T23:45:20.000Z',
      type: 'location_tags_changed',
      user: 'admin',
    }, {
      data: {
        entryId: db.id('581f166110a1482dd0b7ea02'),
        isVisit: false,
        markdown: null,
        filepath: '2009/RxRvKSlbl/radar.jpg',  // the sample contains this
        mimetype: 'image/jpeg',
        thumbfilepath: '2009/RxRvKSlbl/radar_medium.jpg',
        thumbmimetype: 'image/jpeg',
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
      isLayered: true,
      name: 'Irbene',
      points: 0,
      places: [],
      tags: ['walk-in'],
      text1: '',  // new
      text2: '',  // new
    }],
  },
};
