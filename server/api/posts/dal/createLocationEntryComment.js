const db = require('georap-db');
const eventsDal = require('../../events/dal');

module.exports = (params, callback) => {
  // Add new comment object to entry.comments
  //
  // Parameters:
  //   params
  //     locationId
  //     entryId
  //     locationName
  //     username
  //     markdown: markdown UTF8 string
  //     attachments: optional array of attachment keys
  //   callback
  //     function (err)
  //
  // Precondition:
  //   markdown is sanitized
  //
  const createdAt = db.timestamp();
  const rand1 = Math.random().toString().substr(2, 10);
  const rand2 = Math.random().toString().substr(2, 10);
  const commentId = createdAt.substr(0, 4) + rand1 + rand2; // 24 chars

  let attachments = [];
  if (params.attachments) {
    attachments = params.attachments;
  }

  const comment = {
    id: commentId,
    time: createdAt,
    user: params.username,
    markdown: params.markdown,
    attachments: attachments,
  };

  const coll = db.collection('entries');
  const filter = { _id: params.entryId };

  const update = {
    $set: {
      activeAt: createdAt,
    },
    $push: {
      comments: comment,
    },
  };

  coll.updateOne(filter, update, (err) => {
    if (err) {
      return callback(err);
    }

    const eventParams = {
      locationId: params.locationId,
      locationName: params.locationName,
      entryId: params.entryId,
      comment: comment,
    };

    eventsDal.createLocationEntryCommentCreated(eventParams, callback);
  });
};
