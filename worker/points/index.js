
var userDal = require('../../server/api/users/user/dal');
var usersDal = require('../../server/api/users/dal');
var async = require('async');

exports.run = function (callback) {

  usersDal.getAll(function (err, users) {
    if (err) {
      return callback(err);
    }

    async.eachSeries(users, function iteratee(u, cb) {
      userDal.computePointsAndStore(u.name, cb);
    }, function (err2) {
      if (err2) {
        return callback(err2);
      }

      var msg = 'points: Points of users (' + users.length + ')' +
                'computed and stored.';
      console.log(msg);
      return callback();
    });
  });

};
