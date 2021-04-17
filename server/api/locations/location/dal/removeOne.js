const db = require('tresdb-db');
const eventsDal = require('../../../../events/dal');

module.exports = function (id, username, callback) {
  // Remove single location
  //
  // Parameters:
  //   id
  //     ObjectId
  //   username
  //     string
  //   callback
  //     function (err)
  //

  var coll = db.collection('locations');

  // Prevent deletion of already deleted location.
  var q = {
    _id: id,
    deleted: false,
  };
  var u = {
    $set: {
      deleted: true,
    },
  };

  coll.findOneAndUpdate(q, u, function (err, result) {
    if (err) {
      return callback(err);
    }

    if (result.value === null) {
      // Already deleted or not found at all. Success but no event.
      return callback();
    }

    var loc = result.value;

    eventsDal.createLocationRemoved({
      locationId: loc._id,
      locationName: loc.name,
      username: username,
    }, callback);
  });
};
