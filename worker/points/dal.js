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

    // Compute UNIX timestamp and ensure order.
    var evsTimeUnix = evs.map(function (ev) {
      return Object.assign({}, ev, {
        timeUnix: new Date(ev.time),
      });
    }).sort(function (eva, evb) {
      return eva.timeUnix - evb.timeUnix;
    });

    // Event time frames
    var d30 = 30 * 24 * 60 * 60 * 1000; // eslint-disable-line no-magic-numbers
    var d7 = 7 * 24 * 60 * 60 * 1000; // eslint-disable-line no-magic-numbers
    var unix30daysAgo = Date.now() - d30;
    var unix7daysAgo = Date.now() - d7;
    var evs30days = evsTimeUnix.filter(function (ev) {
      return ev.timeUnix > unix30daysAgo;
    });
    var evs7days = evsTimeUnix.filter(function (ev) {
      return ev.timeUnix > unix7daysAgo;
    });

    // Point Categories
    var ps = {
      allTime: exports.sumPoints(evs),
      days30: exports.sumPoints(evs30days),
      days7: exports.sumPoints(evs7days),
    };

    var isOk = function (num) {
      return typeof num === 'number' && !isNaN(num);
    };

    // Assert
    var typerr;
    if (!isOk(ps.allTime) || !isOk(ps.days30) || !isOk(ps.days7)) {
      typerr = new Error('Invalid scene points sum: ' + JSON.stringify(ps));
      return callback(typerr);
    }

    return callback(null, ps);
  });
};

exports.computePointsAndStore = function (username, callback) {
  //
  // Parameters:
  //   username
  //   callback
  //     function (err)
  //
  exports.computePoints(username, function (err, pointCategories) {
    if (err) {
      return callback(err);
    }

    var coll = db.get().collection('users');

    var q = { name: username };
    var u = {
      $set: {
        points: pointCategories.allTime,
        points30days: pointCategories.days30,
        points7days: pointCategories.days7,
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
