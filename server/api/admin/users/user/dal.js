
var db = require('../../../../services/db');
var blacklistDal = require('../../../../services/blacklist');

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

  // Assert
  if (typeof username !== 'string' || typeof callback !== 'function') {
    throw new Error('invalid parameters');
  }

  blacklistDal.has(username, function (errbl, isBlacklisted) {
    if (errbl) {
      return callback(errbl, null);
    }

    var coll = db.collection('users');
    var q = { name: username };
    var proj = { hash: false };

    coll.find(q).project(proj).toArray(function (err, users) {
      var u;

      if (err) {
        return callback(err);
      }

      if (users && users.length > 0) {
        u = users[0];

        u.isBlacklisted = isBlacklisted;

        return callback(null, u);
      }

      // not found
      return callback(null, null);
    });
  });

};


exports.setRole = function (username, isAdmin, callback) {
  // Set user role
  //
  // Parameters:
  //   username
  //   isAdmin
  //   callback
  //     function (err)

  if (typeof username !== 'string' || typeof isAdmin !== 'boolean') {
    throw new Error('invalid parameters');
  }

  var coll = db.collection('users');
  var q = { name: username };
  var up = { $set: { 'admin': isAdmin } };

  coll.updateOne(q, up, function (err) {
    if (err) {
      return callback(err);
    }
    return callback();
  });
};
