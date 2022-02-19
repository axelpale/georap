const db = require('georap-db');
const models = require('georap-models');
const eventsDal = require('../../events/dal');
const postModel = models.entry;

module.exports = (params, callback) => {
  // Parameters:
  //   params
  //     username
  //       The user who deletes the comment.
  //       Not necessarily the author of the comment.
  //     locationId
  //     locationName
  //     entry
  //       post object. Needed to refresh post.activeAt.
  //     commentId
  //       determines the comment to remove
  //   callback
  //     function (err)

  const coll = db.collection('entries');

  // Post to modify
  const postId = params.entry._id;
  // Comment to remove
  const commentId = params.commentId;
  // Post before comment removal
  const postBefore = params.entry;

  // Collect removed comment to pass it to the event creation.
  const removedComment = postBefore.comments.find((comm) => {
    return comm.id === commentId;
  });

  // If comment already removed, exit early and successfully
  if (!removedComment) {
    return callback();
  }

  // Determine next activeAt (most recent comment).
  const postAfter = Object.assign({}, postBefore, {
    comments: postBefore.comments.filter((comm) => {
      return comm.id !== commentId;
    }),
  });

  // Deletion time
  const deletedAt = db.timestamp();
  // User who deletes
  const deletedBy = params.username;

  // Replace the comment with a placeholder
  const filter = {
    _id: postId,
    'comments.id': commentId,
  };
  const update = {
    $set: {
      // Update entry activity timestamp
      activeAt: postModel.activeAt(postAfter),
      // Replace matched comment with deleted one
      // TODO use commentModel forward, but problem is that it isnt immutable
      'comments.$': {
        id: commentId,
        user: deletedBy,
        time: deletedAt,
        markdown: '', // destroy possibly rough content
        attachments: [], // destroy possibly rough content
        deleted: true, // new prop
        deletedAt: deletedAt, // new prop
        deletedBy: deletedBy, // new prop
      },
    },
  };
  // Note for development:
  // Pre-v14 we remove the comment instead of replace.
  // const filter =
  //   _id: postId,
  // };
  // const update = {
  //   $set: {
  //     activeAt: postModel.activeAt(postAfter),
  //   },
  //   $pull: {
  //     comments: {
  //       id: commentId,
  //     },
  //   },
  // };

  coll.updateOne(filter, update, (err) => {
    if (err) {
      return callback(err);
    }

    const eventParams = {
      username: params.username,
      time: deletedAt,
      locationId: params.locationId,
      locationName: params.locationName,
      entryId: params.entry._id,
      commentId: params.commentId,
      comment: removedComment,
    };
    eventsDal.createLocationEntryCommentRemoved(eventParams, callback);
  });
};
