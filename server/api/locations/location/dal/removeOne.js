const db = require('georap-db');
const eventsDal = require('../../../events/dal');

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

  const coll = db.collection('locations');

  // Prevent deletion of already deleted location.
  const q = {
    _id: id,
    deleted: false,
  };
  const u = {
    $set: {
      deleted: true,
    },
  };

  coll.findOneAndUpdate(q, u, (err, result) => {
    if (err) {
      return callback(err);
    }

    if (result.value === null) {
      // Already deleted or not found at all. Success but no event.
      return callback();
    }

    const loc = result.value;

    eventsDal.createLocationRemoved({
      locationId: loc._id,
      locationName: loc.name,
      username: username,
    }, callback);
  });
};
