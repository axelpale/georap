
var db = require('../../server/services/db');
var eventsDal = require('../../server/api/events/dal');
var pointsDal = require('../points/dal');

exports.computePoints = function (locationId, callback) {
  // Compute scenepoints for single location. Scenepoints are computed
  // from events.

  eventsDal.getAllOfLocation(locationId, function (err, evs) {
    if (err) {
      return callback(err);
    }

    var points = pointsDal.sumPoints(evs);

    return callback(null, points);
  });
};

exports.computePointsAndStore = function (locationId, callback) {
  // Parameters:
  //   locationId
  //   callback
  //     function (err)

  exports.computePoints(locationId, function (err, points) {
    if (err) {
      return callback(err);
    }

    var coll = db.collection('locations');

    var q = { _id: locationId };
    var u = {
      $set: {
        points: points,
      },
    };

    coll.updateOne(q, u, function (err2) {
      if (err2) {
        return callback(err2);
      }

      return callback(null);
    });
  });
};
