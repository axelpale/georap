// Location entries API adapter
//
var request = require('./lib/request');

exports.getLatest = function (range, callback) {
  // Fetch latest non-deleted entries
  //
  // Parameters
  //   range
  //     skip
  //       integer, skip this many before results
  //     limit
  //       integer, max number of entries to fetch
  //   callback
  //     function (err, result) where result has properties
  //       entries
  //
  return request.getJSON({
    url: '/api/posts',
    data: {
      skip: range.skip,
      limit: range.limit,
    },
  }, callback);
};

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
    url: '/api/posts',
    data: {
      locationId: locId,
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
    url: '/api/posts/' + entryId,
    data: {
      entryData: entryData,
    },
  }, callback);
};

exports.move = function (params, callback) {
  // Move post and all its content from a location to another.
  //
  // Parameters
  //   params
  //     entryId
  //     toLocationId
  //   callback
  //     function (err)
  //
  var entryId = params.entryId;
  var toLocationId = params.toLocationId;

  return request.postJSON({
    url: '/api/posts/' + entryId + '/move',
    data: {
      toLocationId: toLocationId,
    },
  }, callback);
};

exports.remove = function (locationId, entryId, callback) {
  // Delete a post
  //
  return request.deleteJSON({
    url: '/api/posts/' + entryId,
    data: {},
  }, callback);
};

// Post's comments

exports.createComment = function (params, callback) {
  // Create a comment
  //
  // Parameters:
  //   params, object with props
  //     entryId
  //     markdown
  //       comment content string in Markdown
  //     attachments
  //       array of attachment keys
  //   callback
  //     function (err)
  //
  var entryId = params.entryId;
  var markdown = params.markdown;
  var attachments = params.attachments;

  if (typeof markdown !== 'string' || markdown.length === 0) {
    return callback(new Error('Invalid comment message'));
  }

  return request.postJSON({
    url: '/api/posts/' + entryId + '/comments',
    data: {
      markdown: markdown,
      attachments: attachments,
    },
  }, callback);
};

exports.changeComment = function (params, callback) {
  // Update comment
  //
  // Parameters:
  //   params, object with props
  //     entryId
  //       id string
  //     commentId
  //       id string
  //     markdown
  //       string
  //     attachments
  //       array of attachment keys
  //   callback
  //     function (err)
  //
  var entryId = params.entryId;
  var commentId = params.commentId;
  var markdown = params.markdown;
  var attachments = params.attachments;

  return request.postJSON({
    url: '/api/posts/' + entryId + '/comments/' + commentId,
    data: {
      markdown: markdown,
      attachments: attachments,
    },
  }, callback);
};

exports.removeComment = function (params, callback) {
  // Delete a comment
  //
  // Parameters:
  //   params, object with props
  //     entryId
  //       id string
  //     commentId
  //       id string
  //   callback
  //     function (err)
  //
  var entryId = params.entryId;
  var commentId = params.commentId;

  return request.deleteJSON({
    url: '/api/posts/' + entryId + '/comments/' + commentId,
    data: {},
  }, callback);
};
