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

  var locColl = db.collection('locations');

  var q = { _id: params.locationId };
  var u = { $set: { name: params.newName } };

  locColl.updateOne(q, u, function (err) {
    if (err) {
      return callback(err);
    }

    var oldName = params.locationName;

    eventsDal.createLocationNameChanged({
      locationId: params.locationId,
      locationName: params.locationName,
      username: params.username,
      newName: params.newName,
      oldName: oldName,
    }, function (err2) {
      if (err2) {
        return callback(err2);
      }

      return callback();
    });
  });
};
