
// In this version increase:
// - Create _id for each content entry
// - Remove neighborsAvgDist property

var iter = require('../iter');
var schema = require('../lib/schema');
var shortid = require('shortid');
var db = require('../../server/services/db');

var FROM_VERSION = 3;
var TO_VERSION = FROM_VERSION + 1;

exports.run = function (callback) {
  // Parameters
  //   callback
  //     function (err)

  console.log();
  console.log('### Step v' + FROM_VERSION + ' to v' + TO_VERSION + ' ###');

  // 1. Schema version tag update
  console.log('Setting schema version tag...');

  schema.setVersion(TO_VERSION, function (err) {
    if (err) {
      return callback(err);
    }  // else

    console.log('Schema version tag created.');

    // 2. Transform locations
    console.log('Transforming locations\' content to have _id and');
    console.log('lose neighborsAvgDist field...');

    var locsColl = db.collection('locations');

    iter.updateEach(locsColl, function (loc, next) {

      loc.content = loc.content.map(function (entry) {
        entry._id = shortid.generate();
        return entry;
      });

      delete loc.neighborsAvgDist;

      return next(loc);
    }, function (err2) {

      if (err2) {
        return callback(err2);
      }  // else

      console.log('Locations successfully transformed.');

      console.log('### Step successful ###');

      return callback();
    });
  });
};
