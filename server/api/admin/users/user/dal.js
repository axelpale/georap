
var db = require('../../../../services/db');

exports.getUserForAdmin = function (username, callback) {
  // Fetch an array of users with admin-only information such as email.
  //
  // Parameters:
  //   callback
  //     function (err, userObj)
  //       Parameters:
  //         err
  //         userObj
  //           null if not found

  var coll = db.collection('users');
  var q = { name: username };
  var proj = { hash: false };

  coll.find(q).project(proj).toArray(function (err, users) {
    if (err) {
      return callback(err);
    }

    if (users && users.length > 0) {
      return callback(null, users[0]);
    }

    // not found
    return callback(null, null);
  });
};
