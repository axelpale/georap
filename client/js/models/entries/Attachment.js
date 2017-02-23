// Usage:
//   var att = new Attachment(entry, location)

var config = require('../../../config');
var urljoin = require('url-join');
var makeEntry = require('./lib/makeEntryModel');
var assertEntryType = require('./lib/assertEntryType');

module.exports = function (rawEntry, location) {
  // Parameters:
  //   rawEntry
  //     plain content entry object
  //   location
  //     models.Location instance. Work as a parent.

  assertEntryType(rawEntry.type, 'location_attachment');

  makeEntry(this, rawEntry, location);

  this.getUrl = function () {
    return urljoin(config.uploadUrl, rawEntry.data.filepath);
  };

  this.getMimeType = function () {
    return rawEntry.data.mimetype;
  };
};
