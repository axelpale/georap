// Usage:
//   var att = new Attachment(entry, location)

var config = require('../../../../../config');
var makeEntryModel = require('../lib/makeEntryModel');
var assertEntryType = require('../lib/assertEntryType');

var urljoin = require('url-join');

module.exports = function (rawEntry, entries) {
  // Parameters:
  //   rawEntry
  //     plain content entry object
  //   entries
  //     EntriesModel instance. Work as a parent.

  assertEntryType(rawEntry.type, 'location_attachment');

  makeEntryModel(this, rawEntry, entries);

  this.getUrl = function () {
    return urljoin(config.uploadUrl, rawEntry.data.filepath);
  };

  this.getMimeType = function () {
    return rawEntry.data.mimetype;
  };

  this.getThumbUrl = function () {
    return urljoin(config.uploadUrl, rawEntry.data.thumbpath);
  };

  this.getThumbMimeType = function () {
    return rawEntry.data.thumbmimetype;
  };
};
