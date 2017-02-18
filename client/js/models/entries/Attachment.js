// Usage:
//   var att = new Attachment(entry, location)

var makeEntry = require('../lib/makeEntry');
var assertEntryType = require('../lib/assertEntryType');

module.exports = function (rawEntry, location) {
  // Parameters:
  //   rawEntry
  //     plain content entry object
  //   location
  //     models.Location instance. Work as a parent.

  assertEntryType(rawEntry.type, 'location_attachment');

  makeEntry(this, rawEntry, location);

  this.getUrl = function () {
    return rawEntry.data.url;
  };

  this.getMimeType = function () {
    return rawEntry.data.mimetype;
  };
};
