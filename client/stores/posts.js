// Location posts API adapter
//
var request = require('./lib/request');

exports.getLatest = function (range, callback) {
  // Fetch latest non-deleted posts
  //
  // Parameters
  //   range
  //     skip
  //       integer, skip this many before results
  //     limit
  //       integer, max number of posts to fetch
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

exports.create = function (locId, postData, callback) {
  // Create a new post.
  //
  // Parameters
  //   locId
  //     location id
  //   postData, object with following props
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
      entryData: postData,
    },
  }, callback);
};

exports.change = function (locId, postId, postData, callback) {
  // Update a post.
  //
  // Parameters:
  //   locId
  //     location id
  //   postId
  //   postData, object with following props
  //     markdown
  //     attachments
  //     flags
  //   callback
  //     function (err)
  //
  return request.postJSON({
    url: '/api/posts/' + postId,
    data: {
      entryData: postData,
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
  var postId = params.entryId;
  var toLocationId = params.toLocationId;

  return request.postJSON({
    url: '/api/posts/' + postId + '/move',
    data: {
      toLocationId: toLocationId,
    },
  }, callback);
};

exports.remove = function (locationId, postId, callback) {
  // Delete a post
  //
  return request.deleteJSON({
    url: '/api/posts/' + postId,
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
  //     function (err, response)
  //       err
  //       response
  //         { commentId: <string>, changed: <bool> }
  //           , where changed is normally true, except in the rare case
  //             that comment data before and after the submit stay identical.
  //             In other words, if user re-submits the same edit, it is
  //             processed only once.
  //
  var postId = params.entryId;
  var commentId = params.commentId;
  var markdown = params.markdown;
  var attachments = params.attachments;

  return request.postJSON({
    url: '/api/posts/' + postId + '/comments/' + commentId,
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
  var postId = params.entryId;
  var commentId = params.commentId;

  return request.deleteJSON({
    url: '/api/posts/' + postId + '/comments/' + commentId,
    data: {},
  }, callback);
};
