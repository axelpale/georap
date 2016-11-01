var async = require('async');
var neighbors = require('./lib/neighbors');
var maxDistance = require('./lib/maxDistance');
var DensityList = require('./lib/DensityList');

var BOTTOM_LAYER = 15;
var NEIGHBORHOOD = 7;  // k

exports.recomputeNeighborsAvgDist = function (db, callback) {
  // Recompute average distance value for each location.


  var coll = db.get('locations');

  neighbors.updateEachAvgDist(coll, NEIGHBORHOOD, function (err) {
    if (err) {
      return callback(err);
    }  // else

    return callback(null);
  });
};

exports.findWithin = function (options) {
  // Used by the locations handler.
  // Most calls to this function are coming from real users.
  //
  // Options:
  //   db
  //     monk db instance
  //   center
  //     [lng lat]
  //   radius
  //     integer, meters
  //   query
  //     a limiting query
  //   callback
  //     function (err, locations)

  var db = options.db;
  var center = options.center;
  var radius = options.radius;
  var query = options.query;
  var callback = options.callback;

  var coll = db.get('locations');

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
        limit: 1000,
        query: query,
        distanceField: 'dist',
        spherical: true,
      },
    },
    // Return only what is needed for displaying markers and infowindows.
    {
      $project: {
        name: true,
        geom: true,
        tags: true,
      },
    },
  ]).then(function (results) {
    return callback(null, results);
  }).catch(callback);
};

exports.findDensest = function (coll, callback) {
  // Find all locations, order by density, densest first.
  //
  // Parameters
  //   coll
  //     locations collection
  //   callback
  //     function (err, locations)

  // Find all, order by density, densest first.
  coll.find({}, {
    sort: {
      neighborsAvgDist: 1,
    },
  }).then(function (locs) {
    return callback(null, locs);
  }).catch(callback);
};

exports.findDensestOnLayer = function (coll, layer, callback) {
  // Find all locations, order by density, densest first.
  //
  // Parameters
  //   coll
  //     locations collection
  //   layer
  //     integer, the returned locations must be on this layer.
  //   callback
  //     function (err, locations)

  // Find all, order by density, densest first.
  coll.find({
    layer: layer,
  }, {
    sort: {
      neighborsAvgDist: 1,
    },
  }).then(function (locs) {
    return callback(null, locs);
  }).catch(callback);
};

exports.updateLocationLayer = function (coll, loc, l, callback) {
  // Parameters:
  //   coll
  //     locations collection
  //   loc
  //     location object
  //   l
  //     integer. The new level.
  //   callback
  //     function (err)
  coll.update(loc._id, {
    $set: {
      layer: l,
    },
  }).then(function (results) {
    // Results contain data about the operation.
    // console.log('updated location layer from ', loc.layer, 'to', l);
    return callback(null, results);
  }).catch(callback);
};

exports.flatten = function (coll, l, callback) {
  // Reset layer of each location in coll to l.
  //
  // Parameters:
  //   coll
  //     locations collection
  //   l
  //     integer, the layer onto set every location.
  //   callback
  //     function (err)

  coll.update({}, {
    $set: {
      layer: l,
    },
  }, {
    // Update multiple
    multi: true,
  }).then(function (results) {
    // Results contain data about the operation.
    return callback(null, results);
  }).catch(callback);
};

exports.computeLayer = function (db, layer, callback) {

  console.log('computeLayer', layer);

  var coll = db.get('locations');

  // Get locations on the layer and order by their density and
  // store them into a list.
  exports.findDensestOnLayer(coll, layer, function (err, locs) {

    console.log('number of locs on layer:', locs.length);

    if (err) {
      return callback(err);
    }

    var dl = new DensityList(locs);

    // Until the list is empty...
    async.until(function stopTest() {
      return dl.isEmpty();
    }, function run(next) {

      // Find the densest of the list.
      var top = dl.popDensest();

      // Find the desired radius of the cluster on this zoom level.
      var d = maxDistance.getFromZoomLevel(layer);

      //console.log('Top:', top.name);
      //console.log('find neighbors within ', d, 'meters on layer', layer);

      // Find neighbors within that radius.
      neighbors.findWithinLayer({
        collection: coll,
        location: top,
        maxDistance: d,
        layer: layer,
      }, function (err2, neighborLocs) {

        if (err2) {
          return next(err2);
        }

        if (neighborLocs.length > 0) {

          //console.log('Neighbors:');
          //console.log(neighborLocs.map(function (loc) { return loc.name; }));

          // console.log(neighborLocs.length.toString(), 'neighbors found');

          // Remove the neighbors from the list because they become grouped
          // as a cluster with the "top".
          dl.removeMultiple(neighborLocs);

          //console.log('Number of neighbors removed:', n);
        }

        // The "top" loc will represent the whole cluster on higher layers.
        // Thus, we decrease its layer property.
        exports.updateLocationLayer(coll, top, layer - 1, function (err3) {

          if (err3) {
            return next(err3);
          }

          // Go and find a new "top".
          next();
        });

      });

    }, function then(err4) {

      // Finally, the density list became empty. Each location cluster
      // on the layer now has a representative on the higher layer.

      if (err4) {
        return callback(err4);
      }

      callback();
    });
  });
};

exports.recomputeClusters = function (db, callback) {

  var coll = db.get('locations');

  // 1. Reset clustering data.

  async.waterfall([
    function (cb) {
      // Ensure geospatial index exist before recomputing because
      // the index is required.
      coll.ensureIndex({ 'geom': '2dsphere' }).then(function () {
        return cb(null, db);
      }).catch(function (err) {
        return cb(err);
      });
    },
    exports.recomputeNeighborsAvgDist,
    function (cb) {
      cb(null, coll, BOTTOM_LAYER);
    },
    exports.flatten,
  ], function (err) {

    if (err) {
      return callback(err);
    }

    // 2. Compute clustering data.

    // For each layer, from bottom to top...
    async.timesSeries(BOTTOM_LAYER, function (i, next) {
      var layer = BOTTOM_LAYER - i;

      return exports.computeLayer(db, layer, next);
    }, function then(err2) {

      return callback(err2);
    });

  });

};
