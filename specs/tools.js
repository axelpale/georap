
var async = require('async');

exports.loadFixture = function (db, fixture, callback) {
  // Load fixture into the database. Existing collections in the DB
  // will be dropped.
  //
  // Parameters:
  //   db
  //     Monk DB instance to insert the fixture to.
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
  if (!fixture.hasOwnProperty('indices')) {
    indices = [];
  } else {
    indices = fixture.indices;
  }

  async.eachOfSeries(colls, function (items, collName, next) {

    var coll = db.get(collName);

    // Drop possibly existing collection before population.
    coll.drop().then(function () {
      // Populate
      coll.insert(items).then(function () {
        // Next collection
        return next();
      }).catch(next);
    }).catch(next);

  }, function afterEachOfSeries(err) {

    // Create indices
    async.eachSeries(indices, function (index, next) {

      var coll = db.get(index.collection);

      coll.ensureIndex(index.spec, index.options, function (err) {
        return next(err);
      });

    }, function afterEachSeries(err) {
      return callback(err);
    });

  });

};
