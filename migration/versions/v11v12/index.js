/* eslint-disable max-lines */

// In this version increase:
// 1. set schema version to 12
// 2. Remove orphan event i.e. entry events whose entry has been deleted.
//    Do this to simplify entry event refactor.
// 3. refactor entries
// 4. refactor entry events
//
// Also, new indices were made and thus 'npm run migrate' is needed.

const db = require('tresdb-db');
const schema = require('../../lib/schema');
const iter = require('../../iter');
const asyn = require('async');
const clone = require('clone');
const removeOrphanEvents = require('./removeOrphanEvents');

const FROM_VERSION = 11;
const TO_VERSION = FROM_VERSION + 1;

// Steps to be executed with asyn.eachSeries in the given order.
// The parameter 'nextStep' is function (err) that must be called in the end of
// each step.
const substeps = [

  function updateSchema (nextStep) {
    console.log('1. Updating schema version tag...');

    schema.setVersion(TO_VERSION, function (err) {
      if (err) {
        return nextStep(err);
      }

      console.log('Schema version tag created:', TO_VERSION);
      return nextStep(null);
    });
  },

  function createCollection (nextStep) {
    console.log('2. Remove orphan events...');

    removeOrphanEvents((err, numRemoved) => {
      if (err) {
        return nextStep(err);
      }

      console.log('  ' + numRemoved + ' orphan entry events were removed.');
      return nextStep();
    });
  },

  function refactorEntries (nextStep) {
    console.log('3. Refactor entries and create attachments...');
    // TODO handle overlay

    enColl.find().project({
      _id: 1,
    }).toArray((err, entryIds) => {
      if (err) {
        return nextStep(err);
      }

      asyn.eachSeries(entryIds, (wrappedEntryId, eachNext) => {
        migrateEntry(wrappedEntryId._id, eachNext);
      }, (eachErr) => {
        if (eachErr) {
          return nextStep(eachErr);
        }
        console.log('  ' + entryIds.length + ' entries were migrated.');
        return nextStep();
      });
    });
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
