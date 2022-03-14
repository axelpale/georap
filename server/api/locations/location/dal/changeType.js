const db = require('georap-db');
const asyn = require('async');
const eventsDal = require('../../../events/dal');

module.exports = function (params, callback) {
  // Parameters:
  //   params
  //     locationId
  //     locationName
  //     username
  //       string
  //     oldStatus
  //       string, old status
  //     newStatus
  //       string, new status
  //     oldType
  //       string, old type
  //     newType
  //       string, new type
  //   callback
  //     function (err)
  //

  const q = { _id: params.locationId };
  const u = {
    $set: {
      status: params.newStatus,
      type: params.newType,
    },
  };

  db.collection('locations').updateOne(q, u, (err) => {
    if (err) {
      return callback(err);
    }

    asyn.series([
      (next) => {
        if (params.oldStatus === params.newStatus) {
          return next();
        }
        eventsDal.createLocationStatusChanged({
          locationId: params.locationId,
          locationName: params.locationName,
          username: params.username,
          oldStatus: params.oldStatus,
          newStatus: params.newStatus,
        }, next);
      },

      (next) => {
        if (params.oldType === params.newType) {
          return next();
        }
        eventsDal.createLocationTypeChanged({
          locationId: params.locationId,
          locationName: params.locationName,
          username: params.username,
          oldType: params.oldType,
          newType: params.newType,
        }, next);
      },
    ], (err2) => {
      if (err2) {
        return callback(err2);
      }

      return callback();
    });
  });
};
