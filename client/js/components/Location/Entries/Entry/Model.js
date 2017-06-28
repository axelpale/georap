/* eslint-disable max-statements */

// Usage:
//   var en = new Entry(rawEntry, entries)

var config = window.tresdb.config;
var locations = require('../../../../stores/locations');

var emitter = require('component-emitter');
var urljoin = require('url-join');
var marked = require('marked');

module.exports = function (rawEntry, entries) {
  // Parameters:
  //   rawEntry
  //     plain content entry object
  //   entries
  //     EntriesModel instance. Work as a parent.

  if (typeof rawEntry !== 'object') {
    throw new Error('Missing or invalid rawEntry object.');
  }

  if (typeof entries !== 'object') {
    throw new Error('Missing or invalid entries model.');
  }

  if (rawEntry.type !== 'location_entry') {
    throw new Error('Wrong entry type for location_entry: ' + rawEntry.type);
  }

  var self = this;
  emitter(self);

  self.change = function (form, callback) {
    // Parameters:
    //   form
    //     jQuery instance of edit form

    var lid = rawEntry.locationId;
    var eid = rawEntry._id;
    locations.changeEntry(lid, eid, form, callback);
  };

  self.getId = function () {
    return rawEntry._id;
  };

  self.getType = function () {
    return rawEntry.type;
  };

  self.getTime = function () {
    return rawEntry.time;
  };

  self.getUserName = function () {
    return rawEntry.user;
  };

  self.getLocation = function () {
    // Return Location.Model instance
    return entries.getLocation();
  };

  self.hasMarkdown = function () {
    return (typeof rawEntry.data.markdown === 'string');
  };

  self.getMarkdown = function () {
    // Null if no markdown
    return rawEntry.data.markdown;
  };

  self.getMarkdownHTML = function () {
    if (!self.hasMarkdown()) {
      return null;
    }

    return marked(rawEntry.data.markdown, { sanitize: true });
  };

  self.isVisit = function () {
    return rawEntry.data.isVisit;
  };

  self.hasFile = function () {
    return (typeof rawEntry.data.filepath === 'string');
  };

  self.hasImage = function () {
    // Return true if attachment is an image
    var HEAD = 6;
    if (self.hasFile()) {
      return (rawEntry.data.mimetype.substr(0, HEAD) === 'image/');
    }
    return false;
  };

  self.getFileName = function () {
    // Get filename part of attachment file path.
    // Null if no file.
    //
    // For example if filepath === '/foo/bar/baz.jpg'
    // then getFileName() === 'baz.jpg'
    var p = rawEntry.data.filepath;

    if (self.hasFile()) {
      return p.substr(p.lastIndexOf('/') + 1);
    }
    return null;
  };

  self.getUrl = function () {
    if (self.hasFile()) {
      return urljoin(config.uploadUrl, rawEntry.data.filepath);
    }
    return null;
  };

  self.getMimeType = function () {
    // Return null if no file
    return rawEntry.data.mimetype;
  };

  self.getThumbUrl = function () {
    if (self.hasFile()) {
      return urljoin(config.uploadUrl, rawEntry.data.thumbfilepath);
    }
    return null;
  };

  self.getThumbMimeType = function () {
    // Return null if no file
    return rawEntry.data.thumbmimetype;
  };

  self.remove = function (callback) {
    // Remove entry from the backend
    var lid = rawEntry.locationId;
    var eid = rawEntry._id;
    locations.removeEntry(lid, eid, callback);
  };
};
