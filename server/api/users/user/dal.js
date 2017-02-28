var db = require('../../../services/db');
var eventsDal = require('../../events/dal');
var getPoints = require('../../../../client/js/components/lib/getPoints');

exports.computePoints = function (username, callback) {
  // Compute scenepoints for single user. Scenepoints are computed
  // from events.

  eventsDal.getAllOfUser(username, function (err, evs) {
    if (err) {
      return callback(err);
    }

    var points = evs.reduce(function (acc, ev) {
      return acc + getPoints(ev);
    }, 0);

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

exports.getOne = function (username, callback) {
  // Get single user
  //
  // Parameters:
  //   username
  //     string
  //   callback
  //     function (err, user)
  //       err null and user null if no user found
  //

  var usersColl = db.get().collection('users');
  var proj = {
    hash: false,
    email: false,
  };

  usersColl.findOne({ name: username }, proj, function (err, doc) {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(null, null);
    }

    var num = 10;
    var before = (new Date()).toISOString();

    eventsDal.getRecentOfUser(username, num, before, function (err2, docs) {
      if (err2) {
        return callback(err2);
      }

      doc.events = docs;

      return callback(null, doc);
    });

  });
};
