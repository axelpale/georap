
// In this version increase:
// - Create _id for each content entry
// - Remove neighborsAvgDist property

const iter = require('../../lib/iter');
const schema = require('../../lib/schema');
const shortid = require('shortid');
const db = require('georap-db');

const FROM_VERSION = 3;
const TO_VERSION = FROM_VERSION + 1;

exports.run = function (callback) {
  // Parameters
  //   callback
  //     function (err)

  console.log();
  console.log('### Step v' + FROM_VERSION + ' to v' + TO_VERSION + ' ###');

  // 1. Schema version tag update
  console.log('Setting schema version tag...');

  schema.setVersion(TO_VERSION, (err) => {
    if (err) {
      return callback(err);
    }  // else

    console.log('Schema version tag created.');

    // 2. Transform locations
    console.log('Transforming locations\' content to have _id and');
    console.log('lose neighborsAvgDist field...');

    const locsColl = db.collection('locations');

    iter.updateEach(locsColl, (loc, next) => {

      loc.content = loc.content.map((entry) => {
        entry._id = shortid.generate();
        return entry;
      });

      delete loc.neighborsAvgDist;

      return next(null, loc);
    }, (err2) => {

      if (err2) {
        return callback(err2);
      }  // else

      console.log('Locations successfully transformed.');

      console.log('### Step successful ###');

      return callback();
    });
  });
};
