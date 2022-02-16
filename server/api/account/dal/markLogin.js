const db = require('georap-db');

module.exports = function (username, callback) {
  // Set last login time to the current time.
  // If user is not found, fails silently.
  //
  // Parameters:
  //   username
  //     string
  //   callback
  //     function (err)
  //
  const users = db.collection('users');

  const q = { name: username };
  const u = {
    $set: {
      loginAt: (new Date()).toISOString(),
    },
  };

  users.updateOne(q, u, (err, result) => {
    if (err) {
      return callback(err);
    }

    if (result.matchedCount === 0) {
      // No users found
      return callback();
    }

    return callback();
  });
};
