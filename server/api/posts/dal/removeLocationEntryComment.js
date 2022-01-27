const db = require('georap-db');
const postModel = require('georap-models').entry;
const eventsDal = require('../../events/dal');

module.exports = (params, callback) => {
  // Parameters:
  //   params
  //     username
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

  const filter = { _id: postId };
  const update = {
    $set: {
      activeAt: postModel.activeAt(postAfter),
    },
    $pull: {
      comments: {
        id: commentId,
      },
    },
  };

  coll.updateOne(filter, update, (err) => {
    if (err) {
      return callback(err);
    }

    const eventParams = {
      username: params.username,
      locationId: params.locationId,
      locationName: params.locationName,
      entryId: params.entry._id,
      commentId: params.commentId,
      comment: removedComment,
    };
    eventsDal.createLocationEntryCommentRemoved(eventParams, callback);
  });
};
