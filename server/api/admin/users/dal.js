
var db = require('tresdb-db');

exports.getUsersForAdmin = function (callback) {
  // Fetch an array of users with admin-only information such as email.
  //
  // Parameters:
  //   callback
  //     function (err, arrayOfUsers)

  var coll = db.collection('users');
  var q = {};
  var proj = { hash: false };

  coll.find(q).project(proj).toArray(function (err, users) {
    if (err) {
      return callback(err);
    }

    return callback(null, users);
  });
};
