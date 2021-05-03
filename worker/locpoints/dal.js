
const db = require('georap-db');
const eventsDal = require('../../server/api/events/dal');
const pointSums = require('../points/sums');

exports.computePoints = function (locationId, callback) {
  // Compute scenepoints for single location. Scenepoints are computed
  // from events.

  eventsDal.getAllOfLocation(locationId, (err, evs) => {
    if (err) {
      return callback(err);
    }

    const points = pointSums.sumPoints(evs);

    return callback(null, points);
  });
};

exports.computePointsAndStore = function (locationId, callback) {
  // Parameters:
  //   locationId
  //   callback
  //     function (err)

  exports.computePoints(locationId, (err, points) => {
    if (err) {
      return callback(err);
    }

    const coll = db.collection('locations');

    const q = { _id: locationId };
    const u = {
      $set: {
        points: points,
      },
    };

    coll.updateOne(q, u, (err2) => {
      if (err2) {
        return callback(err2);
      }

      return callback(null);
    });
  });
};
