const db = require('tresdb-db');

module.exports = function (id, callback) {
  // Get single location without events and entries
  //
  // Parameters:
  //   id
  //     ObjectId
  //   callback
  //     function (err, loc)
  //       err null and loc null if no loc found
  //

  var locColl = db.collection('locations');

  locColl.findOne({ _id: id }, function (err, doc) {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(null, null);
    }

    return callback(null, doc);
  });
};
