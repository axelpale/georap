const db = require('tresdb-db');
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
  //   callback
  //     function (err)
  //

  const q = { _id: params.locationId };
  const u = {
    $set: {
      thumbnail: params.newThumbnail,
    },
  };

  db.collection('locations').updateOne(q, u, function (err) {
    if (err) {
      return callback(err);
    }

    eventsDal.createLocationThumbnailChanged({
      locationId: params.locationId,
      locationName: params.locationName,
      username: params.username,
      newThumbnail: params.newThumbnail,
      oldThumbnail: params.oldThumbnail,
    }, function (err2) {
      if (err2) {
        return callback(err2);
      }

      return callback();
    });
  });
};
