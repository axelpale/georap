const db = require('tresdb-db');
const lib = require('./lib');

module.exports = (params, callback) => {
  // Parameters:
  //   params:
  //     locationId
  //     locationName
  //     username
  //     newThumbnail
  //       string, attachment key
  //     oldThumbnail
  //       string, attachment key
  //

  const newEvent = {
    type: 'location_thumbnail_changed',
    user: params.username,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      original: {
        thumbnail: params.oldThumbnail,
      },
      delta: {
        thumbnail: params.newThumbnail,
      },
    },
  };

  lib.insertAndCompleteAndEmit(newEvent, [
    'data.original.thumbnail',
    'data.delta.thumbnail',
  ], callback);
};
