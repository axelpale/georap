
const db = require('tresdb-db');
const asyn = require('async');

const COLL_NOT_EXISTS_ERROR = 26;

module.exports = function (fixture, callback) {
  // Load fixture into the database. Existing collections in the DB
  // will be dropped. Documents are added in the order they are defined.
  //
  // Parameters:
  //   fixture
  //     a db fixture object with following structure:
  //       {
  //         collections: {
  //           collName: [ document1, document2, ...],
  //           otherCollName: [ ... ],
  //           ...
  //         },
  //         indices: [
  //           {
  //             collection: 'collName',
  //             spec: { fieldName: value },
  //             options: {},
  //           }
  //         ],
  //       }
  //   callback
  //     function (err)
  //
  let indices;

  if (!('collections' in fixture)) {
    return callback(new Error('no fixture collections specified'));
  }
  const colls = fixture.collections;

  // Indices are optional
  if ('indices' in fixture) {
    indices = fixture.indices;
  } else {
    indices = [];
  }

  asyn.eachOfSeries(colls, (items, collName, next) => {

    // Drop possibly existing collection before population.
    db.get().dropCollection(collName, (err) => {
      // Populate
      if (err) {
        // Continue if collection does not exist.
        // Stop if other error.
        if (err.code !== COLL_NOT_EXISTS_ERROR) {
          console.error(err);
          return next(err);
        }
      }

      const coll = db.collection(collName);

      if (items.length > 0) {
        // Bulk insert of zero items throws an error.
        coll.insertMany(items, (err2) => {
          if (err2) {
            return next(err2);
          }
          // Next collection
          return next();
        });
      } else {
        return next();
      }
    });

  }, (err3) => {

    if (err3) {
      return callback(err3);
    }

    // Create indices
    asyn.eachSeries(indices, (index, next) => {

      const coll = db.collection(index.collection);

      coll.createIndex(index.spec, index.options, (err4) => {
        return next(err4);
      });

    }, (err5) => {
      if (err5) {
        return callback(err5);
      }
      return callback();
    });

  });

};
