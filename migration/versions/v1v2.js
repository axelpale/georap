var iter = require('../lib/iter');
var schema = require('../lib/schema');

exports.run = function (db, callback) {

  // 1. Create schema version tag

  var configColl = db.get('config');
  schema.setVersion(configColl, 2, function (err) {
    if (err) {
      return callback(err);
    }  // else

    // 2. Transform locations to have a geometry in GeoJSON

    var locsColl = db.get('locations');
    iter.updateEach(locsColl, function (loc, next) {
      loc.geom = {
        type: 'Point',
        coordinates: [loc.lng, loc.lat],
      };
      delete loc.lng;
      delete loc.lat;

      return next(loc);
    }, function (err2) {
      if (err2) {
        return callback(err2);
      }  // else

      // 3. Create 2dsphere index
      // TODO
    });
  });

};
