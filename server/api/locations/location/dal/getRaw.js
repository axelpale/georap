const db = require('georap-db');

module.exports = function (id, callback) {
  // Get single location without events or posts
  //
  // Parameters:
  //   id
  //     ObjectId
  //   callback
  //     function (err, loc)
  //       err null and loc null if no loc found
  //

  const locColl = db.collection('locations');

  locColl.findOne({ _id: id }, (err, doc) => {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(null, null);
    }

    return callback(null, doc);
  });
};
