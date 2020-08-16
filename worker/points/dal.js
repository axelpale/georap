var db = require('../../server/services/db');
var eventsDal = require('../../server/api/events/dal');
var sums = require('./sums');

exports.computePoints = function (username, callback) {
  // Compute scenepoints for single user. Scenepoints are computed
  // from events.

  eventsDal.getAllOfUser(username, function (err, evs) {
    if (err) {
      return callback(err);
    }

    // Compute UNIX timestamp and ensure order most recent first.
    var evsTimeUnix = evs.map(function (ev) {
      return Object.assign({}, ev, {
        timeUnix: (new Date(ev.time)).getTime(),
      });
    }).sort(function (eva, evb) {
      return evb.timeUnix - eva.timeUnix;
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
      // Scene points
      allTime: sums.sumPoints(evsTimeUnix),
      days30: sums.sumPoints(evs30days),
      days7: sums.sumPoints(evs7days),
      // Statistics
      locationsVisited: sums.sumVisits(evsTimeUnix),
      locationsCreated: sums.sumCreations(evsTimeUnix),
      postsCreated: sums.sumPosts(evsTimeUnix),
      commentsCreated: sums.sumComments(evsTimeUnix),
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
        locationsVisited: pointCategories.locationsVisited,
        locationsCreated: pointCategories.locationsCreated,
        postsCreated: pointCategories.postsCreated,
        commentsCreated: pointCategories.commentsCreated,
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
