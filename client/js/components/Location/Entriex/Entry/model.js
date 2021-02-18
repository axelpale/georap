/* eslint-disable max-statements */

// Usage:
//   var en = new Entry(rawEntry, entries)

var config = window.tresdb.config;
var locations = tresdb.stores.locations;

var emitter = require('component-emitter');
var urljoin = require('url-join');
var ui = require('tresdb-ui');

entry
var unbind = addListeners(entry, entries)


exports.change = function (entry, entryData, callback) {
  // Parameters:
  //   entry
  //     complete entry object
  //   entryData
  //     data from form
  //   callback
  //     function (err)
  //
  locations.changeEntry(entry, entryData, callback);
};

exports.getId = function (entry) {
  return entry._id;
};

exports.getTime = function (entry) {
  return entry.time;
};

exports.getUserName = function (entry) {
  return entry.user;
};

exports.getLocation = function (entry) {
  // Return Location.Model instance
  return entries.getLocation();
};


module.exports = function (rawEntry, entries) {
  // Parameters:
  //   rawEntry
  //     raw entry object with complete attachments
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

  entries.on('location_entry_changed', function (ev) {
    // Skip events of other entries
    if (ev.data.entryId !== rawEntry._id) {
      return;
    }
    // Update changed
    Object.assign(rawEntry, ev.data.delta);
    // Emit for view to react by rerendering.
    self.emit(ev.type, ev);
  });

  entries.on('location_entry_comment_created', function (ev) {
    // Skip events of other entries
    if (ev.data.entryId !== rawEntry._id) {
      return;
    }

    if (!rawEntry.comments) {
      rawEntry.comments = [];
    }

    rawEntry.comments.push(ev.data.comment);

    // Emit for the view to react
    self.emit(ev.type, ev);
  });

  entries.on('location_entry_comment_changed', function (ev) {
    // Skip events of other entries
    if (ev.data.entryId !== rawEntry._id) {
      return;
    }

    if (!rawEntry.comments) {
      // Weird state. But let us be sure.
      rawEntry.comments = [];
    }

    // Update a comment.
    rawEntry.comments = rawEntry.comments.map(function (comm) {
      if (ev.data.commentId === comm.id) {
        return Object.assign({}, comm, ev.data.delta);
      }
      return comm;
    });

    // Emit for the view to react
    self.emit(ev.type, ev);
  });

  entries.on('location_entry_comment_removed', function (ev) {
    // Skip events of other entries
    if (ev.data.entryId !== rawEntry._id) {
      return;
    }

    if (!rawEntry.comments) {
      // No need to update anything
      return;
    }

    // Filter out the removed comment.
    rawEntry.comments = rawEntry.comments.filter(function (comm) {
      return ev.data.commentId !== comm.id;
    });

    // Emit for the view to react
    self.emit(ev.type, ev);
  });


  // Public methods

  self.getLocationId = function () {
    return String(rawEntry.locationId);
  };

  self.hasMarkdown = function () {
    return (typeof rawEntry.markdown === 'string');
  };

  self.getMarkdown = function () {
    // Null if no markdown
    return rawEntry.markdown;
  };

  self.getMarkdownHTML = function () {
    if (!self.hasMarkdown()) {
      return null;
    }
    return ui.markdownToHtml(rawEntry.markdown);
  };

  self.isVisit = function () {
    return rawEntry.flags.indexOf('visit') !== -1;
  };

  self.hasFile = function () {
    return (rawEntry.attachments.length > 0);
  };

  self.getAttachments = function () {
    return rawEntry.attachments;
  };

  self.getImages = function () {
    const HEAD = 6;
    return rawEntry.attachments.filter(at => {
      return at.mimetype.substr(0, HEAD) === 'image/';
    });
  };

  self.getComments = function () {
    return rawEntry.comments;
  };

  self.remove = function (callback) {
    // Remove entry from the backend
    var lid = rawEntry.locationId;
    var eid = rawEntry._id;
    locations.removeEntry(lid, eid, callback);
  };

  self.createComment = function (markdown, callback) {
    var lid = rawEntry.locationId;
    var eid = rawEntry._id;
    locations.createComment(lid, eid, markdown, callback);
  };
};
