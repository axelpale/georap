const db = require('georap-db');
const eventsDal = require('../../../events/dal');

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

  const locColl = db.collection('locations');

  const q = { _id: params.locationId };
  const newStatus = params.status;
  const u = { $set: { status: newStatus } };

  locColl.updateOne(q, u, (err) => {
    if (err) {
      return callback(err);
    }

    const oldStatus = params.locationStatus;

    eventsDal.createLocationStatusChanged({
      locationId: params.locationId,
      locationName: params.locationName,
      username: params.username,
      newStatus: newStatus,
      oldStatus: oldStatus,
    }, (err2) => {
      if (err2) {
        return callback(err2);
      }

      return callback();
    });
  });
};
