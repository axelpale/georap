/* eslint-disable no-magic-numbers, no-sync, max-lines */

var config = require('tresdb-config');
var db = require('../../server/services/db');
var bcrypt = require('bcryptjs');
var ObjectId = require('mongodb').ObjectId;

var id = function (k) {
  return new ObjectId(k);
};

var admin = config.admin.username;

module.exports = {
  collections: {
    config: [
      {
        _id: id('58092312bbba430a35fb4139'),
        key: 'schemaVersion',
        value: 9,
      },
    ],
    entries: [],
    events: [],
    locations: [],
    users: [
      {
        _id: id('5867bdf00a5a9e18d7755e4f'),
        admin: true,
        email: config.admin.email,
        hash: bcrypt.hashSync(config.admin.password, config.bcrypt.rounds),
        name: admin,
        points: 0, // points are updated by worker
        status: 'active',
      },
    ],
  },
  indices: db.INDICES,
};
