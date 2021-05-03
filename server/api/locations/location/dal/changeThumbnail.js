const db = require('georap-db');
const eventsDal = require('../../../events/dal');

module.exports = (params, callback) => {
  // Parameters:
  //   params
  //     username
  //       string
  //     locationId
  //     locationName
  //       string
  //     oldThumbnail
  //       string, attachment key
  //     newThumbnail
  //       string, attachment key
  //     silent
  //       optional boolean. Default false. Does not create or emit event.
  //   callback
  //     function (err)
  //
  params = Object.assign({
    silent: false,
  }, params);

  const q = { _id: params.locationId };
  const u = {
    $set: {
      thumbnail: params.newThumbnail,
    },
  };

  db.collection('locations').updateOne(q, u, (err) => {
    if (err) {
      return callback(err);
    }

    if (params.silent) {
      return callback();
    }

    eventsDal.createLocationThumbnailChanged({
      locationId: params.locationId,
      locationName: params.locationName,
      username: params.username,
      newThumbnail: params.newThumbnail,
      oldThumbnail: params.oldThumbnail,
    }, callback);
  });
};
