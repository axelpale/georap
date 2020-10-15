/* eslint-disable no-magic-numbers */
// NOTE This file documents the data structure of v4.

var c = require('./common');

module.exports = {
  collections: {
    config: [{
      key: 'schemaVersion',
      value: 4,
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
        _id: 'Aebej323',
        type: 'created',
        user: 'admin',
        time: '2009-07-30T10:44:58.000Z',
        data: {},
      }, {
        _id: 'Aebej324',
        type: 'story',
        user: 'admin',
        time: '2009-09-04T23:44:21.000Z',
        data: {
          markdown: 'A ghost town',
        },
      }, {
        _id: 'Aebej325',
        type: 'attachment',
        user: 'admin',
        time: '2009-10-02T11:11:01.000Z',
        data: {
          filename: 'radar.jpg',
          key: 'RxRvKSlbl',
          mimetype: 'image/jpeg',
        },
      }],
      layer: 12,
    }],
  },
};
