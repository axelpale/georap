var db = require('../../services/db');

exports.getAll = function (callback) {
  // Get all users
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

  coll.find({}, proj).toArray(function (err, users) {
    if (err) {
      return callback(err);
    }

    return callback(null, users);
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

  var coll = db.get().collection('users');
  var proj = {
    hash: false,
    email: false,
  };

  coll.findOne({ name: username }, proj, function (err, doc) {
    if (err) {
      return callback(err);
    }

    if (!doc) {
      return callback(null, null);
    }

    return callback(null, doc);
  });
};
