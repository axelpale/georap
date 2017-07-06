var db = require('../../server/services/db');
var eventsDal = require('../../server/api/events/dal');
var getPoints = require('../../client/js/components/lib/getPoints');

exports.sumPoints = function (evs) {
  // Return sum of points of given events.
  return evs.reduce(function (acc, ev) {
    return acc + getPoints(ev);
  }, 0);
};

exports.computePoints = function (username, callback) {
  // Compute scenepoints for single user. Scenepoints are computed
  // from events.

  eventsDal.getAllOfUser(username, function (err, evs) {
    if (err) {
      return callback(err);
    }

    var points = exports.sumPoints(evs);
    var typerr;

    // Assert
    if (typeof points !== 'number' || isNaN(points)) {
      typerr = new Error('Invalid scene points sum: ' + points);
      return callback(typerr);
    }

    return callback(null, points);
  });
};

exports.computePointsAndStore = function (username, callback) {
  // Parameters:
  //   username
  //   callback
  //     function (err, points)
  exports.computePoints(username, function (err, points) {
    if (err) {
      return callback(err);
    }

    var coll = db.get().collection('users');

    var q = { name: username };
    var u = {
      $set: {
        points: points,
      },
    };

    coll.updateOne(q, u, function (err2) {
      if (err2) {
        return callback(err2);
      }

      return callback(null, points);
    });
  });
};
