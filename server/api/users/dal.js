const db = require('georap-db');

exports.count = (callback) => {
  // Count users
  //
  // Parameters:
  //   callback
  //     function (err, number)
  //
  db.collection('users')
    .countDocuments({})
    .then((number) => {
      return callback(null, number);
    })
    .catch((err) => {
      return callback(err);
    });
};

exports.getAll = (callback) => {
  // Get all users, ordered by points, descending
  //
  // Parameters:
  //   callback
  //     function (err, users)
  //

  const proj = {
    hash: false,
    email: false,
  };

  db.collection('users')
    .find({})
    .project(proj)
    .sort({ points: -1 })
    .toArray((err, users) => {
      if (err) {
        return callback(err);
      }

      return callback(null, users);
    });
};
