/* eslint-disable max-lines */

// In this version increase:
// 1. set schema version to 12
// 2. create collection for attachments
// 3. refactor entries
// 4. refactor entry events
//
// Also, new indices were made and thus 'npm run migrate' is needed.

const db = require('tresdb-db');
const schema = require('../../lib/schema');
const iter = require('../../iter');
const asyn = require('async');
const clone = require('clone');

const FROM_VERSION = 11;
const TO_VERSION = FROM_VERSION + 1;

// Steps to be executed with asyn.eachSeries in the given order.
// The parameter 'next' is function (err) that must be called in the end of
// each step.
const substeps = [

  function updateSchema (next) {
    console.log('1. Updating schema version tag...');

    schema.setVersion(TO_VERSION, function (err) {
      if (err) {
        return next(err);
      }

      console.log('Schema version tag created:', TO_VERSION);
      return next(null);
    });
  },

  function createCollection (next) {
    console.log('2. Creating collection for attachments...');

    return next();
  },

  function refactorEntries (next) {
    console.log('3. Refactor entries and create attachments...');
    // TODO ensure comments: []
    // TODO overlay

    const atColl = db.collection('attachments');
    const enColl = db.collection('entries');
    const evColl = db.collection('events');

    iter.updateEach(enColl, function (origEntry, iterNext) {

    }, next);
  },

  function refactorEntryEvents (next) {
    console.log('4. Refactor entry events...');
    // TODO requires attachment ids from prev step.
    return next();
  },

];

exports.run = (callback) => {
  // Parameters
  //   callback
  //     function (err)

  console.log();
  console.log('### Step v' + FROM_VERSION + ' to v' + TO_VERSION + ' ###');

  asyn.series(substeps, function (err) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    return callback();
  });
};
