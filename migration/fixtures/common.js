const config = require('georap-config');
const bcrypt = require('bcryptjs');
const db = require('georap-db');

// eslint-disable-next-line no-sync
exports.PASSWORD = bcrypt.hashSync('admin_password', config.bcrypt.rounds);

exports.irbeneId = db.id('581f166110a1482dd0b7cd13');
exports.locatorEntryId = db.id('581f166110a1482dd0b7ea02');

// This is a special id. No object with this _id should exist in database.
exports.missingId = db.id('581f01234567890123456789');
