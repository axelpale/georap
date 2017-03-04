
var db = require('../../server/services/db');
var googlemaps = require('../../server/services/googlemaps');
var async = require('async');

// For Google Maps API usage limits, see:
// https://developers.google.com/maps/documentation/geocoding/usage-limits
var SECOND = 1000;
var PLACES_PER_SECOND = googlemaps.LIMIT_PER_SECOND;  // lag provides margin
var PLACES_PER_JOB = 30;
var INTERVAL = Math.round(SECOND / PLACES_PER_SECOND);

exports.run = function (callback) {

  var coll = db.collection('locations');

  var cursor = coll.find({ places: [] }).limit(PLACES_PER_JOB);

  var reverseAndStore = function (loc, cb) {
    // Parameters:
    //   loc
    //     raw location
    //   cb
    //     function (err)

    var latlng = [loc.geom.coordinates[1], loc.geom.coordinates[0]];

    googlemaps.reverseGeocode(latlng, function (err, places) {
      if (err) {
        return cb(err);
      }

      var q = { _id: loc._id };
      var u = { $set: { places: places } };
      coll.updateOne(q, u, function (err2) {
        if (err2) {
          return cb(err2);
        }
        return cb();
      });
    });
  };

  cursor.toArray(function (err, locs) {
    if (err) {
      return callback(err);
    }

    async.eachSeries(locs, function iteratee(loc, cb) {
      setTimeout(function () {
        reverseAndStore(loc, cb);
      }, INTERVAL);
    }, function (err2) {
      if (err2) {
        return callback(err2);
      }

      var msg = 'places: reverse geocodes for ' + locs.length + ' locations ' +
                'computed and stored.';
      console.log(msg);
      return callback();
    });
  });

};
