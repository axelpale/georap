const db = require('georap-db');

module.exports = (entryId, callback) => {
  // Find single entry
  //
  // Parameters:
  //   entryId
  //   callback
  //     function (err, entryDoc)
  //
  const q = {
    _id: entryId,
  };

  db.collection('entries')
    .findOne(q, (err, doc) => {
      if (err) {
        return callback(err);
      }

      if (!doc) {
        return callback(null, null);
      }

      return callback(null, doc);
    });
};
