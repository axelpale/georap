const lib = require('./lib');

module.exports = (params, callback) => {
  // Parameters:
  //   params:
  //     username
  //     time
  //       a timestamp
  //     locationId
  //     locationName
  //     entryId
  //     commentId
  //       id of the removed comment
  //     comment
  //       removed comment
  //   callback
  //     function (err)
  //
  const newEvent = {
    type: 'location_entry_comment_removed',
    user: params.username,
    time: params.time,
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.entryId,
      commentId: params.commentId,
      comment: params.comment,
    },
  };

  lib.insertAndEmit(newEvent, callback);
};
