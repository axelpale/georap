/* eslint-disable max-lines */

// In this version increase:
// 1. set schema version to 12
// 2. Remove orphan event i.e. entry events whose entry has been deleted.
//    Do this to simplify entry event refactor.
// 3. Drop possible 'attachments' collections from earlier failed migration.
// 4. refactor entries and entry events
// 5. refactor locations by adding published prop
// 6. refactor locations by adding createdAt prop
//
// Also, new indices were made and thus 'npm run migrate' is needed.

const db = require('tresdb-db');
const asyn = require('async');
const clone = require('clone');
const schema = require('../../lib/schema');
const iter = require('../../iter');
const removeOrphanEvents = require('./removeOrphanEvents');
const migrateEntry = require('./migrateEntry');

const FROM_VERSION = 11;
const TO_VERSION = FROM_VERSION + 1;

// Steps to be executed with asyn.eachSeries in the given order.
// The parameter 'nextStep' is function (err) that must be called in the end of
// each step.
const substeps = [

  function updateSchema(nextStep) {
    console.log('1. Updating schema version tag...');

    schema.setVersion(TO_VERSION, function (err) {
      if (err) {
        return nextStep(err);
      }

      console.log('Schema version tag created:', TO_VERSION);
      return nextStep(null);
    });
  },

  function removeOrphan(nextStep) {
    console.log('2. Remove orphan events...');

    removeOrphanEvents((err, numRemoved) => {
      if (err) {
        return nextStep(err);
      }

      console.log('  ' + numRemoved + ' orphan entry events were removed.');
      return nextStep();
    });
  },

  function dropFailed(nextStep) {
    console.log('3. Drop possible attachments collection...');

    db.get().dropCollection('attachments', (err, wasDropped) => {
      if (err) {
        return nextStep(err);
      }
      if (wasDropped) {
        console.log('  The attachments collection was dropped successfully.');
      } else {
        console.log('  No need to drop collections.');
      }
      return nextStep();
    });
  },

  function refactorEntries(nextStep) {
    console.log('4. Refactor entries and create attachments...');

    db.collection('entries')
      .find()
      .project({
        _id: 1,
      })
      .toArray((err, entryIds) => {
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

  function migrateLocations(nextStep) {
    console.log('5. Add published prop and ensure visits prop in locations...');

    const coll = db.collection('locations');

    iter.updateEach(coll, function (origLoc, iterNext) {
      var loc = clone(origLoc);
      loc.visits = [];
      loc.published = false;
      return iterNext(null, loc);
    }, nextStep);
  },

  function addCreatedAt(nextStep) {
    console.log('6. Add createdAt prop to each location...');

    const coll = db.collection('locations');

    iter.updateEach(coll, function (origLoc, iterNext) {
      db.collection('events').findOne({
        locationId: origLoc._id,
        type: 'location_created',
      }, (err, locEv) => {
        if (err) {
          return iterNext(err);
        }

        if (!locEv) {
          const msg = 'Missing location_created event for ' + origLoc._id;
          return iterNext(new Error(msg));
        }

        const loc = clone(origLoc);
        loc.createdAt = locEv.time;
        return iterNext(null, loc);
      });
    }, nextStep);
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
