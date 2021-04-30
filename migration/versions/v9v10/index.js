/* eslint-disable max-lines */

// In this version increase:
// 1. set schema version to 10
// 2. create visits property for each location for filtering needs.
//
// Also, new indices were made and thus 'npm run migrate' is needed.

const db = require('georap-db');
const schema = require('../../lib/schema');
const iter = require('../../lib/iter');
const asyn = require('async');
const clone = require('clone');

const FROM_VERSION = 9;
const TO_VERSION = FROM_VERSION + 1;

// Steps to be executed with asyn.eachSeries in the given order.
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

  function addVisitsProp(next) {
    console.log('2. Adding visits and childLayer properties to each loc...');

    const coll = db.collection('locations');

    iter.updateEach(coll, (origLoc, iterNext) => {
      const loc = clone(origLoc);
      loc.childLayer = 0;
      loc.visits = [];
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

  asyn.series(substeps, (err) => {
    if (err) {
      console.error(err);
      return callback(err);
    }

    return callback();
  });
};
