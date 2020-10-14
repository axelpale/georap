var local = require('../../config/local');
var bcrypt = require('bcryptjs');
var db = require('tresdb-db');

// eslint-disable-next-line no-sync
exports.PASSWORD = bcrypt.hashSync('admin_password', local.bcrypt.rounds);

exports.irbeneId = db.id('581f166110a1482dd0b7cd13');
