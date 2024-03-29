const db = require('georap-db');

module.exports = (username, callback) => {
  // Return all non-deleted posts created by user,
  // ordered from oldest to newest.
  //
  // Parameters
  //   username
  //     string
  //   callback
  //     function (err, posts) where
  //       posts
  //         array
  //
  const q = {
    user: username,
    deleted: false,
  };

  db.collection('entries')
    .find(q)
    .sort({ time: 1 })
    .toArray(callback);
};
