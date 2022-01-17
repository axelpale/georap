const db = require('georap-db');

exports.count = (callback) => {
  // Count users
  //
  // Parameters:
  //   callback
  //     function (err, number)
  //

  // Do not count deleted users
  const q = {
    deleted: false,
  };

  db.collection('users')
    .countDocuments(q)
    .then((number) => {
      return callback(null, number);
    })
    .catch((err) => {
      return callback(err);
    });
};

exports.getAll = (callback) => {
  // Get all non-deleted users, ordered by points, descending
  //
  // Parameters:
  //   callback
  //     function (err, users)
  //

  const q = {
    deleted: false,
  };
  const proj = {
    hash: false,
    email: false,
  };

  db.collection('users')
    .find(q)
    .project(proj)
    .sort({ points: -1 })
    .toArray((err, users) => {
      if (err) {
        return callback(err);
      }

      return callback(null, users);
    });
};
