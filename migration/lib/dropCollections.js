const asyn = require('async');

module.exports = (db, callback) => {
  // Drop all collections in the given db.
  //
  // Parameters:
  //   db
  //     georap-db instance
  //
  db.get()
    .listCollections({})
    .toArray((err, colls) => {
      if (err) {
        return callback(err);
      }

      const collNames = colls.map(c => c.name);

      asyn.eachSeries(collNames, (collName, next) => {
        // Drop possibly existing collection before population.
        db.get().dropCollection(collName, next);
      }, (eachErr) => {
        if (eachErr) {
          return callback(eachErr);
        }
        return callback();
      });
    });
};
