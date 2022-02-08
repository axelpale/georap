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

      // Ensure worker-generated props
      const canonical = users.map((u) => {
        return Object.assign({}, u, {
          points: u.points ? u.points : 0,
          points7days: u.points7days ? u.points7days : 0,
          points30days: u.points30days ? u.points30days : 0,
          points365days: u.points365days ? u.points365days : 0,
        });
      });

      return callback(null, canonical);
    });
};
