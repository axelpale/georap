const db = require('georap-db');
const entryModel = require('georap-models').entry;
const eventsDal = require('../../events/dal');

module.exports = (params, callback) => {
  // Parameters:
  //   params
  //     username
  //     locationId
  //     locationName
  //     entry
  //       entry object. Needed to determine next entry.activeAt.
  //     commentId
  //       determines the comment to remove
  //   callback
  //     function (err)

  const coll = db.collection('entries');

  // Entry to modify
  const entryId = params.entry._id;
  // Comment to remove
  const commentId = params.commentId;
  // Entry before removal
  const entryBefore = params.entry;

  // Collect removed comment to pass it to the event creation.
  const removedComment = entryBefore.comments.find((comm) => {
    return comm.id === commentId;
  });

  // If comment already removed, exit early and successfully
  if (!removedComment) {
    return callback();
  }

  // Determine next activeAt (most recent comment).
  const entryAfter = Object.assign({}, entryBefore, {
    comments: entryBefore.comments.filter((comm) => {
      return comm.id !== commentId;
    }),
  });

  const filter = { _id: entryId };
  const update = {
    $set: {
      activeAt: entryModel.activeAt(entryAfter),
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
