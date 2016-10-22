/* eslint-disable */
// Reductive hierarchical clustering
// for 20 cluster abstraction levels.

var zpad = require('zpad');
var async = require('async');

var MIN_LEVEL = 0;
var MAX_LEVEL = 20;

// Earth radius in meters.
var R = 6371000;

// Desired distance between markers in pixels.
var D = 100;
// Assumed width of average view of the user in pixels.
var W = 1000;

// Name of location collection. The names of cache collections are
// based on this.
var COLL = 'locations';

var getCollectionName = function (level) {
  // Return for example 'locations03' for level 3.

  if (typeof level !== 'number') {
    throw new Error('Invalid level: ' + level + '. A number is required.');
  }
  if (MIN_LEVEL > level || MAX_LEVEL < level) {
    throw new Error('Level out of level limits: ' + level);
  }

  return COLL + zpad(level, 2);
};

var getLevelCollection = function (db, level) {
  // Return Monk collection object.
  return db.get(getCollectionName(level));
};

var getMaxDistance = function (level) {
  // This function defines the neighborhood size.
  //
  // A method to obtain reasonable neighborhood:
  // On level 0, the width of the map is the length of the equator.
  // Thus, upper limit for maxDistance is 2*PI*R / 2, where R is the
  // radius of the earth, 6 371 000 m.
  //     Let's assume user's view is 1000 px wide and a marker is 25 px wide.
  // Also, assume the radius of 50 px to provide loose enough marker
  // arrangement. Now, if 1000 px ~ 2*PI*R, then 50 px ~ 50 * 2*PI*R / 1000.
  // The maxDistance in meters on level 0 is therefore PI * R / 10.
  //     For each lower abstraction level, i.e. higher level number, the
  // width of the view in meters is halved. For level 1, 1000 px ~ PI*R, for
  // level 2, 1000 px ~ PI*R/2, and so on. Thus, for level n, 1000 px ~
  // 2*PI*R * (1/2)^n, and the radius around the marker i.e. maxDistance
  // (50 * 2*PI*R / 1000) * (1/2)^n.
  //     To translate this on JS, let us start with the form:
  // maxDistance = ((D / 2) * 2*PI*R / W) * Math.pow(0.5, level), where D is
  // the desired distance between markers and W is the average width of
  // the view. We simplify the expression:
  return (D * Math.PI * R * Math.pow(0.5, level)) / W;
};

var computeLayer = function (sourceColl, targetColl, options, callback) {

  // Default options:
  if (typeof options !== 'object') {
    options = {};
  }
  if (!options.hasOwnProperty('gap')) {
    throw new Error('gap is a required option');
  }

  targetColl.find({}).then(function (locs) {
    async.eachSeries(locs, function (loc, next) {

    }, function afterEach(err) {

    });
  }).catch(callback);
};

exports.generate = function (db, callback) {
  // Generate the clusters.
  //
  // Parameters
  //   db
  //     Monk db instance
  //   callback
  //     function (err)

  var locationsColl = db.get(COLL);

  var computeDensity = function () {

  };

  var computeDistanceBetween = function (loc0, loc1) {

  };

  var computeAverageDistance = function (loc, neighbors) {

  };

  var getNeighbors = function (level, loc) {
    // Parameters:
    //   collection
    //     A result of Mong db.get(...)
    //   loc
    //     A location which neigbors to retrieve.
  };

  var updateLocations = function (locs) {
    async.each(locs, function (loc, next) {
      // See http://caolan.github.io/async/docs.html#each
      locationsColl.aggregate([{
        $geoNear: {
          spherical: true,
          limit: 100,
          near: [23.73, 61.47],
          distanceField: 'dist.calculated',
          includeLocs: 'dist.location',
        },
      }]).then({

      });

      runCommand({
        geoNear: 'locations',
        near: loc.geom,
        spherical: true,
        query: {},
      });  // runCommand not available in Monk
      locationsColl.find({
        geom: {
          $geoNear: {
            $geometry: loc.geom,
            $minDistance: 1,  // Do not include loc
            $maxDistance: 1000,  // TODO find good value
          },
        },
      }).then(function (neighbors) {

      }).catch();
    });
  };

  var handleError = function (err) {
    return callback(err);
  };

  locationsColl.find({}, { fields: { name: 1, geom: 1} })
    .then(updateLocations)
    .catch(handleError);
};

//
// for i in [0, 1, ..., n - 1]
//   all = db.locations[i].find()
//   for loc in all
//     neighbors = db.locations[i].getInsideArea(area_around(loc))
//     dist = average_distance_to(neighbors)
//     loc.neighborDensity = 1 / dist
//     loc.neighbors = get_ids(neighbors)
//     db.locations[i].update(loc)
//   ordered = db.locations[i].find(order_by: 'neighborDensity', descending)
//   // descending = highest first
//   while (ordered.length > 0)
//     first = ordered.shift();  // should be O(1)
//     db.locations[i + 1].insert(first)
//     ordered.remove(first)
//     ordered.remove(first.neighbors)
