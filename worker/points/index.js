
const dal = require('./dal');
const usersDal = require('../../server/api/users/dal');
const asyn = require('async');

exports.run = function (callback) {

  usersDal.getAll((err, users) => {
    if (err) {
      return callback(err);
    }

    asyn.eachSeries(users, (u, cb) => {
      dal.computePointsAndStore(u.name, cb);
    }, (err2) => {
      if (err2) {
        return callback(err2);
      }

      const msg = 'points: Points of users (' + users.length + ') ' +
                'computed and stored.';
      console.log(msg);
      return callback();
    });
  });

};
