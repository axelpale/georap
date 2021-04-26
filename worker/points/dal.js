const db = require('tresdb-db');
const eventsDal = require('../../server/api/events/dal');
const sums = require('./sums');

exports.computePoints = function (username, callback) {
  // Compute scenepoints for single user. Scenepoints are computed
  // from events.

  eventsDal.getAllOfUser(username, (err, evs) => {
    if (err) {
      return callback(err);
    }

    // Compute UNIX timestamp and ensure order most recent first.
    const evsTimeUnix = evs.map((ev) => {
      return Object.assign({}, ev, {
        timeUnix: (new Date(ev.time)).getTime(),
      });
    }).sort((eva, evb) => {
      return evb.timeUnix - eva.timeUnix;
    });

    // Event time frames
    // eslint-disable-next-line no-magic-numbers
    const d30 = 30 * 24 * 60 * 60 * 1000;
    const d7 = 7 * 24 * 60 * 60 * 1000; // eslint-disable-line no-magic-numbers
    const unix30daysAgo = Date.now() - d30;
    const unix7daysAgo = Date.now() - d7;
    const evs30days = evsTimeUnix.filter((ev) => {
      return ev.timeUnix > unix30daysAgo;
    });
    const evs7days = evsTimeUnix.filter((ev) => {
      return ev.timeUnix > unix7daysAgo;
    });

    // Point Categories
    const ps = {
      // Scene points
      allTime: sums.sumPoints(evsTimeUnix),
      days30: sums.sumPoints(evs30days),
      days7: sums.sumPoints(evs7days),
      // Statistics
      flagsCreated: sums.sumFlags(evsTimeUnix), // object, not int
      locationsCreated: sums.sumCreations(evsTimeUnix), // int
      postsCreated: sums.sumPosts(evsTimeUnix),
      locationsClassified: sums.sumClassifications(evsTimeUnix),
      commentsCreated: sums.sumComments(evsTimeUnix),
    };

    const isOk = function (num) {
      return typeof num === 'number' && !isNaN(num);
    };

    // Assert
    let typerr;
    if (!isOk(ps.allTime) || !isOk(ps.days30) || !isOk(ps.days7)) {
      typerr = new Error('Invalid scene points sum: ' + JSON.stringify(ps));
      return callback(typerr);
    }

    return callback(null, ps);
  });
};

exports.computePointsAndStore = (username, callback) => {
  //
  // Parameters:
  //   username
  //   callback
  //     function (err)
  //
  exports.computePoints(username, (err, pointCategories) => {
    if (err) {
      return callback(err);
    }

    const coll = db.collection('users');

    const q = { name: username };
    const u = {
      $set: {
        flagsCreated: pointCategories.flagsCreated,
        locationsCreated: pointCategories.locationsCreated,
        postsCreated: pointCategories.postsCreated,
        locationsClassified: pointCategories.locationsClassified,
        commentsCreated: pointCategories.commentsCreated,
        points: pointCategories.allTime,
        points30days: pointCategories.days30,
        points7days: pointCategories.days7,
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
