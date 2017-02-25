// Usage:
//   var att = new Attachment(entry, location)

var config = require('../../../../../config');
var locations = require('../../../../stores/locations');
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

  this.remove = function (callback) {
    // Remove entry from the backend
    var lid = rawEntry.locationId;
    var eid = rawEntry._id;
    locations.removeAttachment(lid, eid, callback);
  };
};
