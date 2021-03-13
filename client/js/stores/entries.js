// Location entries API adapter
//
var request = require('./lib/request');

exports.create = function (locId, entryData, callback) {
  // Create new entry.
  //
  // Parameters
  //   locId
  //     location id
  //   entryData, object with following props
  //     markdown
  //     attachments
  //     flags
  //   callback
  //     function (err, newEntry)
  //
  return request.postJSON({
    url: '/api/locations/' + locId + '/entries',
    data: {
      entryData: entryData,
    },
  }, callback);
};

exports.change = function (locId, entryId, entryData, callback) {
  // Update an entry.
  //
  // Parameters:
  //   locId
  //     location id
  //   entryId
  //   entryData, object with following props
  //     markdown
  //     attachments
  //     flags
  //   callback
  //     function (err)
  //
  return request.postJSON({
    url: '/api/locations/' + locId + '/entries/' + entryId,
    data: {
      entryData: entryData,
    },
  }, callback);
};

exports.remove = function (locationId, entryId, callback) {
  // Delete an entry
  //
  return request.deleteJSON({
    url: '/api/locations/' + locationId + '/entries/' + entryId,
    data: {},
  }, callback);
};

// Entry comments

exports.createComment = function (locationId, entryId, markdown, callback) {
  // Parameters:
  //   locationId
  //   entryId
  //   markdown
  //     comment content string in Markdown
  //   callback
  //     function (err)
  //
  if (typeof markdown !== 'string' || markdown.length === 0) {
    return callback(new Error('Invalid comment message'));
  }

  return request.postJSON({
    url: '/api/locations/' + locationId + '/entries/' + entryId + '/comments',
    data: {
      markdown: markdown,
      attachments: [], // future proof
    },
  }, callback);
};

exports.changeComment = function (params, callback) {
  // Update comment
  //
  var locationId = params.locationId;
  var entryId = params.entryId;
  var commentId = params.commentId;
  var markdown = params.newMessage;

  var entryUrl = '/api/locations/' + locationId + '/entries/' + entryId;
  return request.postJSON({
    url: entryUrl + '/comments/' + commentId,
    data: {
      markdown: markdown,
      // attachments: attachments,
    },
  }, callback);
};

exports.removeComment = function (locationId, entryId, commentId, callback) {
  // Delete a comment
  //
  var entryUrl = '/api/locations/' + locationId + '/entries/' + entryId;
  return request.deleteJSON({
    url: entryUrl + '/comments/' + commentId,
    data: {},
  }, callback);
};
