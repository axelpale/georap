// This module is responsible for preparing database locations
// for the clients.

var attachmentPaths = require('./attachmentPaths');
var clone = require('clone');

exports.location = function (location) {
  // Prepares the location to be given for the client.
  // Clones the location

  var cliloc = clone(location);

  // ObjectId to string
  cliloc._id = location._id.toString();

  // Prepare the content too
  cliloc.entries = exports.entries(location.entries);

  return cliloc;
};

exports.entries = function (entries) {
  return entries.map(exports.entry);
};

exports.entry = function (entry) {
  if (entry.type === 'location_attachment') {
    // Attach an url to each attachment.
    entry.data.url = attachmentPaths.getAbsoluteUrl(entry);
  }
  return entry;
};
