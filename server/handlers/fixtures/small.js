/* eslint-disable no-magic-numbers, no-sync */

var local = require('../../../config/local');
var bcrypt = require('bcryptjs');
var mongodb = require('mongodb');
var ObjectId = mongodb.ObjectId;

var ADMIN_USER = 'admin';
var ADMIN_EMAIL = 'admin@example.com';
var ADMIN_PASSWORD = 'admin_password';

var TESTER_USER = 'tester';
var TESTER_EMAIL = 'tester@example.com';
var TESTER_PASSWORD = 'tester_password';


module.exports = {
  collections: {
    users: [
      {
        _id: new ObjectId('5808fe95e38cf69101479fc3'),
        name: ADMIN_USER,
        email: ADMIN_EMAIL,
        hash: bcrypt.hashSync(ADMIN_PASSWORD, local.bcrypt.rounds),
        admin: true,
      },
      {
        _id: new ObjectId('581481912139e804203580bb'),
        name: TESTER_USER,
        email: TESTER_EMAIL,
        hash: bcrypt.hashSync(TESTER_PASSWORD, local.bcrypt.rounds),
        admin: false,
      },
    ],
    locations: [
      {
        _id: new ObjectId('581f166110a1482dd0b7cd13'),
        name: 'Irbene',
        geom: {
          type: 'Point',
          coordinates: [21.857705, 57.55341],
        },
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
        }],
        layer: 1,
      },
    ],
  },
  indices: [
    {
      collection: 'locations',
      spec: { geom: '2dsphere' },
      options: {},
    },
    {
      collection: 'users',
      spec: { name: 1 },
      options: { unique: true },
    },
  ],
};
