/* eslint-disable max-lines */

// In this version increase:
// 1. set schema version to 7
// 2. add text1 and text2 properties for each location

const db = require('tresdb-db');
const schema = require('../../lib/schema');
const iter = require('../../lib/iter');
const async = require('async');
const clone = require('clone');

const FROM_VERSION = 6;
const TO_VERSION = FROM_VERSION + 1;

// Steps to be executed with async.eachSeries in the given order.
// The parameter 'next' is function (err) that must be called in the end of
// each step.
const substeps = [

  function updateSchema(next) {
    console.log('1. Updating schema version tag...');

    schema.setVersion(TO_VERSION, (err) => {
      if (err) {
        return next(err);
      }

      console.log('Schema version tag created:', TO_VERSION);
      return next(null);
    });
  },

  function addPoints(next) {
    console.log('2. Adding properties \'text1\' and \'text2\' ' +
                'to each location...');

    const coll = db.collection('locations');

    iter.updateEach(coll, (origLoc, iterNext) => {
      const loc = clone(origLoc);
      loc.text1 = '';
      loc.text2 = '';
      return iterNext(null, loc);
    }, next);
  },

];

exports.run = function (callback) {
  // Parameters
  //   callback
  //     function (err)

  console.log();
  console.log('### Step v' + FROM_VERSION + ' to v' + TO_VERSION + ' ###');

  async.series(substeps, (err) => {
    if (err) {
      console.error(err);
      return callback(err);
    }

    return callback();
  });
};
