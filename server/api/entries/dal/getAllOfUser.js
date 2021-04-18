const db = require('tresdb-db');

module.exports = (username, callback) => {
  // Return all non-deleted entries created by user,
  // ordered from oldest to newest.
  //
  // Parameters
  //   username
  //     string
  //   callback
  //     function (err, entries)
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
