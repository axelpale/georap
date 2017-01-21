// Prepare data from client to be fed into models.

var errors = require('../../errors');
var ObjectId = require('mongodb').ObjectId;

exports.location = function (location) {
  // Modifies the location in place.
  //
  // Throws
  //   ObjectIdError
  //     if _id is given and does not comply with ObjectId

  if (location.hasOwnProperty('_id')) {
    location._id = exports.id(location._id);
  }

  if (location.hasOwnProperty('content')) {
    location.content = exports.content(location.content);
  }
};

exports.id = function (stringId) {
  // Converts string object id to ObjectId
  //
  // Throws
  //   ObjectIdError
  //     if _id does not comply with ObjectId
  try {
    return new ObjectId(stringId);
  } catch (e) {
    throw errors.ObjectIdError;
  }
};

exports.content = function (entries) {
  return entries.map(exports.entry);
};

exports.entry = function (entry) {
  // Remove url
  if (entry.type === 'attachment') {
    delete entry.data.url;
  }
  return entry;
};
