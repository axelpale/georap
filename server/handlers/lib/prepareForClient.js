// This module is responsible for preparing database content entries
// for the clients.

var attachments = require('../../services/attachments');
var mime = require('mime');

exports.location = function (location) {
  // Prepares the location to be given for the client.
  // Modifies the location in place.

  if (!location.hasOwnProperty('_id')) {
    console.error(location);
    throw new Error('invalid location to be given for the client');
  }

  // ObjectId to string
  location._id = location._id.toString();

  // Prepare the content too
  location.content = exports.content(location.content);
};

exports.content = function (entries) {
  return entries.map(function (entry) {
    if (entry.type === 'attachment') {
      // Attach an url to each attachment.
      entry.data.url = attachments.getAbsoluteUrl(entry);

      // Figure out the content mime type.
      if (!entry.data.hasOwnProperty('mimetype')) {
        entry.data.mimetype = mime.lookup(entry.data.filename);
      }
    }
    return entry;
  });
};
