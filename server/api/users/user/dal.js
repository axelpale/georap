var db = require('../../../services/db');
var eventsDal = require('../../events/dal');

exports.computePoints = function (username, callback) {
  // Compute scenepoints for single user. Scenepoints are computed
  // from events.
  //
  // Achievements:
  // - location_created: +10
  // - location_removed: -10
  // - location_attachment_created: +5
  // - location_attachment_removed: -5
  // - location_story_created: +1
  // - location_story_changed: 0
  // - location_story_removed: -1
  // - location_visit_created: +10
  // - location_visit_removed: -10
  // - location_name_changed: 0
  // - location_geom_changed: +1
  // - location_tags_changed: +2

  var pointMap = {
    'location_created': 10,
    'location_removed': -10,
    'location_attachment_created': 5,
    'location_attachment_removed': -5,
    'location_story_created': 1,
    'location_story_changed': 0,
    'location_story_removed': -1,
    'location_visit_created': 10,
    'location_visit_removed': -10,
    'location_name_changed': 0,
    'location_geom_changed': 1,
    'location_tags_changed': 2,
  };

  eventsDal.getAllOfUser(username, function (err, evs) {
    if (err) {
      return callback(err);
    }

    var points = evs.reduce(function (acc, ev) {
      if (pointMap.hasOwnProperty(ev.type)) {
        return acc + pointMap[ev.type];
      }
      return acc;
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

// exports.getPoints = function (username, callback) {
//   // If user has valid points, return them immediately,
//   // compute and save otherwise.
//
//   var usersColl = db.get().collection('users');
//
//   usersColl.findOne({ name: username }, function (err, doc) {
//     if (err) {
//       return callback(err);
//     }
//
//     if (doc.pointsValid) {
//       return callback(null, doc.points);
//     }
//
//     exports.computePointsAndStore(username, function (err2, points) {
//       if (err2) {
//         return callback(err2);
//       }
//       return callback(null, points);
//     });
//   });
// };

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
      //
      // exports.computePoints(username, function (err3, points) {
      //   if (err3) {
      //     return callback(err3);
      //   }
      //
      //   doc.points = points;
      //
      // });
      return callback(null, doc);
    });

  });
};
