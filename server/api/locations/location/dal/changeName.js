const db = require('tresdb-db');
const eventsDal = require('../../../events/dal');

module.exports = function (params, callback) {
  // Parameters
  //   params
  //     locationId
  //     locationName
  //     newName
  //     username
  //

  const locColl = db.collection('locations');

  const q = { _id: params.locationId };
  const u = { $set: { name: params.newName } };

  locColl.updateOne(q, u, (err) => {
    if (err) {
      return callback(err);
    }

    const oldName = params.locationName;

    eventsDal.createLocationNameChanged({
      locationId: params.locationId,
      locationName: params.locationName,
      username: params.username,
      newName: params.newName,
      oldName: oldName,
    }, (err2) => {
      if (err2) {
        return callback(err2);
      }

      return callback();
    });
  });
};
