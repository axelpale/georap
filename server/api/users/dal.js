var db = require('tresdb-db');

exports.getAll = function (callback) {
  // Get all users, ordered by points, descending
  //
  // Parameters:
  //   callback
  //     function (err, users)
  //

  var coll = db.get().collection('users');
  var proj = {
    hash: false,
    email: false,
  };

  coll
    .find({})
    .project(proj)
    .sort({ points: -1 })
    .toArray(function (err, users) {
      if (err) {
        return callback(err);
      }

      return callback(null, users);
    });
};
