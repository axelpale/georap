/* eslint-disable no-magic-numbers */
// NOTE This file documents the data structure of v3.

var c = require('./common');

module.exports = {
  collections: {
    config: [{
      key: 'schemaVersion',
      value: 3,
    }],
    users: [{
      name: 'admin',
      email: 'admin@example.com',
      hash: c.PASSWORD,
      admin: true,
    }],
    locations: [{
      name: 'Irbene',
      geom: {
        type: 'Point',
        coordinates: [21.857705, 57.55341],
      },
      locatorId: 604,
      deleted: false,
      tags: ['walk-in'],
      content: [{
        type: 'created',
        user: 'admin',
        time: '2009-07-30T10:44:58.000Z',
        data: {},
      }, {
        type: 'story',
        user: 'admin',
        time: '2009-09-04T23:44:21.000Z',
        data: {
          markdown: 'A ghost town',
        },
      }, {
        type: 'attachment',
        user: 'admin',
        time: '2009-10-02T11:11:01.000Z',
        data: {
          filename: 'radar.jpg',
          key: 'RxRvKSlbl',
          mimetype: 'image/jpeg',
        },
      }],
      neighborsAvgDist: 42886.25362949583,
      layer: 12,
    }],
  },
};
