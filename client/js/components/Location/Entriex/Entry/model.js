/* eslint-disable max-statements */
var locations = tresdb.stores.locations;
var models = require('tresdb-models');
var rootBus = require('tresdb-bus');

var commentsModel = require('./Comments/model');

var forwardComments = function (entry, ev) {
  commentsModel.forward(entry.comments, ev);
};

var forwarders = {
  'location_entry_changed': function (entry, ev) {
    Object.assign(entry, ev.data.delta);
  },

  'location_entry_comment_created': forwardComments,
  'location_entry_comment_changed': forwardComments,
  'location_entry_comment_removed': forwardComments,
};

exports.forward = models.forward(forwarders);

exports.bus = models.bus(rootBus, function (entry, ev) {
  return ev.data && ev.data.entryId === entry._id;
});

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

exports.getLocationId = function (entry) {
  return String(entry.locationId);
};

exports.hasMarkdown = function (entry) {
  return (entry.markdown.length > 0);
};

exports.getMarkdown = function (entry) {
  return entry.markdown;
};

exports.isVisit = function (entry) {
  return entry.flags.indexOf('visit') !== -1;
};

exports.hasFile = function (entry) {
  return (entry.attachments.length > 0);
};

exports.getAttachments = function (entry) {
  return entry.attachments;
};

exports.getImage = function (entry) {
  // Return first image attachment. Null if none found.
  //
  var HEAD = 6;
  var i, att;
  for (i = 0; i < entry.attachments; i += 1) {
    att = entry.attachments[i];
    if (att.mimetype.substr(0, HEAD) === 'image/') {
      return att;
    }
  }
  return null;
};

exports.getImages = function (entry) {
  var HEAD = 6;
  return entry.attachments.filter(function (at) {
    return at.mimetype.substr(0, HEAD) === 'image/';
  });
};

exports.getComments = function (entry) {
  return entry.comments;
};

exports.remove = function (entry, callback) {
  // Remove entry from the backend
  var lid = entry.locationId;
  var eid = entry._id;
  locations.removeEntry(lid, eid, callback);
};

exports.createComment = function (entry, markdown, callback) {
  locations.createComment(entry, markdown, callback);
};
