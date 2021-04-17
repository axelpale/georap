const db = require('tresdb-db');

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
