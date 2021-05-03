
const db = require('georap-db');
const googlemaps = require('../../server/services/googlemaps');
const asyn = require('async');

// For Google Maps API usage limits, see:
// https://developers.google.com/maps/documentation/geocoding/usage-limits
const SECOND = 1000;
const PLACES_PER_SECOND = googlemaps.LIMIT_PER_SECOND;  // lag provides margin
const PLACES_PER_JOB = 30;
const INTERVAL = Math.round(SECOND / PLACES_PER_SECOND);

exports.run = function (callback) {

  const coll = db.collection('locations');

  const cursor = coll.find({ places: [] }).limit(PLACES_PER_JOB);

  const reverseAndStore = function (loc, cb) {
    // Parameters:
    //   loc
    //     raw location
    //   cb
    //     function (err)

    const latlng = [loc.geom.coordinates[1], loc.geom.coordinates[0]];

    googlemaps.reverseGeocode(latlng, (err, places) => {
      if (err) {
        return cb(err);
      }

      const q = { _id: loc._id };
      const u = { $set: { places: places } };
      coll.updateOne(q, u, (err2) => {
        if (err2) {
          return cb(err2);
        }
        return cb();
      });
    });
  };

  cursor.toArray((err, locs) => {
    if (err) {
      return callback(err);
    }

    asyn.eachSeries(locs, (loc, cb) => {
      setTimeout(() => {
        reverseAndStore(loc, cb);
      }, INTERVAL);
    }, (err2) => {
      if (err2) {
        return callback(err2);
      }

      const msg = 'places: reverse geocodes for ' + locs.length +
                  ' locations computed and stored.';
      console.log(msg);
      return callback();
    });
  });

};
