var async = require('async');

exports.findNearestOne = function (coll, geom, callback) {
  // Find the single nearest location and distance to it.
  //
  // Parameters:
  //   coll
  //     locations collection
  //   geom
  //     GeoJSON Point
  //   callback
  //     function (err, nearestLoc)

  coll.aggregate([
    {
      $geoNear: {
        near: geom,
        distanceField: 'dist',
        spherical: true,
        limit: 1,  // Retrieve only the closest
      },
    },
  ], function (err, result) {
    if (err) {
      return callback(err);
    }
    return callback(null, result[0]);
  });
};

exports.findNearestOther = function (coll, location, callback) {
  // Find the distance and the single nearest location that is not
  // the given location.

  coll.aggregate([
    {
      $geoNear: {
        near: location.geom,
        query: { _id: { $ne: location._id } },  // exclude the loc itself
        distanceField: 'dist',
        spherical: true,
        limit: 1,  // Retrieve only the closest
      },
    },
  ], function (err, result) {
    if (err) {
      return callback(err);
    }
    return callback(null, result[0]);
  });
};

exports.findWithin = function (coll, loc, d, callback) {
  // Find neighbors within given distance.
  //
  // Parameters:
  //   coll
  //     Locations collection
  //   loc
  //     location document
  //   d
  //     the maximum distance from loc
  //   callback
  //     function (err, neighbors)
  //
  coll.aggregate([
    {
      $geoNear: {
        near: loc.geom,
        distanceField: 'dist',
        minDistance: 1,  // excludes the loc itself
        maxDistance: d,
        spherical: true,
      },
    },
  ], function (err, results) {
    if (err) {
      return callback(err);
    }
    return callback(null, results);
  });
};

exports.findWithinLayer = function (options, callback) {
  // Find neighbors within given distance.
  //
  // Parameters:
  //   options
  //     object
  //   callback
  //     function (err, neighborLocs)
  //
  // Options:
  //   collection
  //     Locations collection
  //   location
  //     location document whose neighbors to find
  //   maxDistance
  //     the maximum distance from location
  //   layer
  //     integer, the layer onto find the locations

  var q = {
    $geoNear: {
      near: options.location.geom,
      distanceField: 'dist',  // mandatory
      minDistance: 1,  // excludes the loc itself
      maxDistance: options.maxDistance,
      spherical: true,
      limit: 1000,
      query: { layer: options.layer },
    },
  };

  options.collection.aggregate([q], function (err, results) {
    if (err) {
      return callback(err);
    }
    return callback(null, results);
  });
};

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
  ], function (err, results) {
    if (err) {
      return callback(err);
    }

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
  });
};

exports.updateAvgDist = function (coll, loc, k, callback) {
  // Upgrade the location document loc in coll by neighbor distance data.

  exports.computeAvgDist(coll, loc, k, function (err, updatedLoc) {

    //console.log('err', err);
    if (err) {
      return callback(err);
    }  // else

    coll.updateOne({ _id: updatedLoc._id }, updatedLoc, function (err2) {
      if (err2) {
        return callback(err2);
      }
      return callback(null);
    });
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

  coll.find().toArray(function (err, locs) {
    if (err) {
      return callback(err);
    }

    async.eachSeries(locs, function (loc, next) {
      exports.updateAvgDist(coll, loc, k, next);
    }, function afterEach(err2) {
      return callback(err2);
    });

  });
};
