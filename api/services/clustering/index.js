
var neighbors = require('./lib/neighbors');


exports.refresh = function (db, callback) {
  // Recompute clustering metrics.

  var NEIGHBORHOOD = 100;  // k

  var coll = db.get('locations');

  neighbors.updateEachAvgDist(coll, NEIGHBORHOOD, function (err) {
    if (err) {
      return callback(err);
    }  // else

    return callback(null);
  });
};

exports.findWithin = function (options) {
  // Options:
  //   db
  //     monk db instance
  //   center
  //     [lng lat]
  //   radius
  //     integer, meters
  //   query (future)
  //     a limiting query
  //   callback
  //     function (err, locations)

  var db = options.db;
  var center = options.center;
  var radius = options.radius;
  var callback = options.callback;

  var coll = db.get('locations');

  // console.log(center);
  // console.log(radius);

  coll.aggregate([
    {
      // See docs:
      // https://docs.mongodb.com/v3.2/reference/operator/aggregation/geoNear/
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: center,
        },
        // If near is specified in GeoJSON, maxDistance takes meters.
        // If near is specified in legacy coordinates, it takes radians.
        maxDistance: radius,
        limit: 5000,
        distanceField: 'dist',
        spherical: true,
      },
    },
    {
      $sort: {
        neighborsAvgDist: -1,  // remotest first
      },
    },
    {
      $limit: 100,
    },
  ]).then(function (results) {
    return callback(null, results);
  }).catch(callback);
};
