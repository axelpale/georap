
var dal = require('./dal');
var usersDal = require('../../server/api/users/dal');
var asyn = require('async');

exports.run = function (callback) {

  usersDal.getAll(function (err, users) {
    if (err) {
      return callback(err);
    }

    asyn.eachSeries(users, function iteratee(u, cb) {
      dal.computePointsAndStore(u.name, cb);
    }, function (err2) {
      if (err2) {
        return callback(err2);
      }

      var msg = 'points: Points of users (' + users.length + ') ' +
                'computed and stored.';
      console.log(msg);
      return callback();
    });
  });

};
