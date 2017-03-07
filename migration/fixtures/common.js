var local = require('../../config/local');
var bcrypt = require('bcryptjs');
var ObjectId = require('mongodb').ObjectId;

// eslint-disable-next-line no-sync
exports.PASSWORD = bcrypt.hashSync('admin_password', local.bcrypt.rounds);

exports.id = function (k) {
  return new ObjectId(k);
};

exports.irbeneId = exports.id('581f166110a1482dd0b7cd13');
