
var db = require('../server/services/db');
var asyn = require('async');

var COLL_NOT_EXISTS_ERROR = 26;

exports.loadFixture = function (fixture, callback) {
  // Load fixture into the database. Existing collections in the DB
  // will be dropped.
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
  var colls, indices;

  if (!fixture.hasOwnProperty('collections')) {
    return callback(new Error('no fixture collections specified'));
  }
  colls = fixture.collections;

  // Indices are optional
  if (fixture.hasOwnProperty('indices')) {
    indices = fixture.indices;
  } else {
    indices = [];
  }

  asyn.eachOfSeries(colls, function (items, collName, next) {

    // Drop possibly existing collection before population.
    db.get().dropCollection(collName, function (err) {
      // Populate
      if (err) {
        // Continue if collection does not exist.
        // Stop if other error.
        if (err.code !== COLL_NOT_EXISTS_ERROR) {
          console.error(err);
          return next(err);
        }
      }

      var coll = db.collection(collName);

      if (items.length > 0) {
        // Bulk insert of zero items throws an error.
        coll.insertMany(items, function (err2) {
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

  }, function afterEachOfSeries(err3) {

    if (err3) {
      return callback(err3);
    }

    // Create indices
    asyn.eachSeries(indices, function (index, next) {

      var coll = db.collection(index.collection);

      coll.createIndex(index.spec, index.options, function (err4) {
        return next(err4);
      });

    }, function afterEachSeries(err5) {
      if (err5) {
        return callback(err5);
      }
      return callback();
    });

  });

};
