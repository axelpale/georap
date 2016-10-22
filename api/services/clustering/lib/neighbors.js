var async = require('async');

exports.computeAvgDist = function (coll, loc, k, callback) {
  // Given single document loc in collection coll
  // - find k nearest neighbors
  // - compute their average distance to loc
  // - attach the avg distance to loc
  // - return the new loc (do not store to database)

  coll.aggregate([
    {
      $geoNear: {
        near: loc.geom,
        limit: k,
        distanceField: 'dist',
        minDistance: 1,  // excludes the loc itself
        spherical: true,
      },
    },
    {
      $group: {
        _id: null,
        neighborsAvgDist: {
          $avg: '$dist',
        },
      },
    },
  ]).then(function (results) {

    var neighborsAvgDist;

    // If there is no nearest neighbors
    if (results.length === 0) {
      neighborsAvgDist = 0;
    } else {
      neighborsAvgDist = results[0].neighborsAvgDist;
    }

    // Update object
    loc.neighborsAvgDist = neighborsAvgDist;

    return callback(null, loc);
  }).catch(callback);
};

exports.updateAvgDist = function (coll, loc, k, callback) {
  // Upgrade the location document loc in coll by neighbor distance data.

  exports.computeAvgDist(coll, loc, k, function (err, updatedLoc) {

    //console.log('err', err);
    if (err) {
      return callback(err);
    }  // else

    coll.update(updatedLoc._id, updatedLoc).then(function () {
      return callback(null);
    }).catch(callback);
  });
};

exports.updateEachAvgDist = function (coll, k, callback) {
  // Upgrade each location document in coll with neighbor distance data.
  //
  // Parameters:
  //   coll
  //     monk collection
  //   k
  //     k as in k nearest neighbors algorithm
  //   callback
  //     function (err)

  coll.find({}).then(function (locs) {

    async.eachSeries(locs, function (loc, next) {
      exports.updateAvgDist(coll, loc, k, next);
    }, function afterEach(err) {
      return callback(err);
    });

  }).catch(callback);
};
