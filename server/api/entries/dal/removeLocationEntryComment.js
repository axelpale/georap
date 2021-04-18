const db = require('tresdb-db');
const eventsDal = require('../../events/dal');

module.exports = (params, callback) => {
  // Parameters:
  //   params
  //     username
  //     locationId
  //     locationName
  //     entryId
  //     commentId
  //   callback
  //     function (err)

  const coll = db.collection('entries');
  const filter = { _id: params.entryId };

  const commentId = params.commentId;

  const update = {
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

    var eventParams = params;
    eventsDal.createLocationEntryCommentRemoved(eventParams, callback);
  });
};
