// Clean up any expired storage content from previous versions.
// TODO do not clean up at minor version updates.
require('./migrate')();

exports.account = require('./account');
exports.admin = require('./admin');
exports.attachments = require('./attachments');
exports.events = require('./events');
exports.filter = require('./filter');
exports.geometry = require('./geometry');
exports.locations = require('./locations');
exports.locales = require('./locales');
exports.mapstate = require('./mapstate');
exports.markers = require('./markers');
exports.posts = require('./posts');
exports.search = require('./search');
exports.statistics = require('./statistics');
exports.theme = require('./theme');
exports.users = require('./users');
