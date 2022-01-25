const db = require('georap-db');

module.exports = (callback) => {
  // Count non-deleted entries
  //
  // Parameters:
  //   callback
  //     function (err, number)
  //
  db.collection('entries')
    .countDocuments({ deleted: false })
    .then((number) => {
      return callback(null, number);
    })
    .catch((err) => {
      return callback(err);
    });
};
