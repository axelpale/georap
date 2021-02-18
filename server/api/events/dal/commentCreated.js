const lib = require('./lib');

module.exports = (params, callback) => {
  // Parameters:
  //   params:
  //     locationId
  //     locationName
  //     entryId
  //     comment
  //       new comment object
  //   callback
  //     function (err)
  //
  const newEvent = {
    type: 'location_entry_comment_created',
    user: params.comment.user,
    time: params.comment.time,
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
      commentId: params.comment.id,
      comment: params.comment,
    },
  };

  lib.insertAndEmit(newEvent, callback);
};
