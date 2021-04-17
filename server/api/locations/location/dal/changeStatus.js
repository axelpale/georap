const db = require('tresdb-db');
const eventsDal = require('../../../../events/dal');

module.exports = function (params, callback) {
  // Parameters:
  //   params
  //     locationId
  //     locationName
  //     locationStatus
  //       string, old status
  //     username
  //       string
  //     status
  //       string, new status
  //   callback
  //     function (err)

  var locColl = db.collection('locations');

  var q = { _id: params.locationId };
  var newStatus = params.status;
  var u = { $set: { status: newStatus } };

  locColl.updateOne(q, u, function (err) {
    if (err) {
      return callback(err);
    }

    var oldStatus = params.locationStatus;

    eventsDal.createLocationStatusChanged({
      locationId: params.locationId,
      locationName: params.locationName,
      username: params.username,
      newStatus: newStatus,
      oldStatus: oldStatus,
    }, function (err2) {
      if (err2) {
        return callback(err2);
      }

      return callback();
    });
  });
};
