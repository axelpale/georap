
const db = require('georap-db');

exports.getUsersForAdmin = function (callback) {
  // Fetch an array of users with admin-only information such as email.
  //
  // Parameters:
  //   callback
  //     function (err, arrayOfUsers)

  const coll = db.collection('users');
  const q = { deleted: false };
  const proj = { hash: false };

  coll.find(q).project(proj).toArray((err, users) => {
    if (err) {
      return callback(err);
    }

    return callback(null, users);
  });
};
