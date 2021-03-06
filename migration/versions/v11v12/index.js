/* eslint-disable max-lines */

// In this version increase:
// 1. set schema version to 12
// 2. Remove orphan event i.e. entry events whose entry has been deleted.
//    Do this to simplify entry event refactor.
// 3. Drop possible 'attachments' collections from earlier failed migration.
// 4. refactor entries and entry events
// 5. refactor locations by adding published prop
// 6. refactor locations by adding createdAt prop
// 7. select thumbnails for each location and add thumbnail prop
// 8. remove visits-related user properties
// 9. add activeAt property to entries
//
// Also, new indices were made and thus 'npm run migrate' is needed.

const db = require('georap-db');
const asyn = require('async');
const clone = require('clone');
const schema = require('../../lib/schema');
const iter = require('../../lib/iter');
const removeOrphanEvents = require('./removeOrphanEvents');
const migrateEntry = require('./migrateEntry');
const getThumbnail = require('./getThumbnail');
const addCreatedAt = require('./addCreatedAt');
const addActiveAt = require('./addActiveAt');
const removeVisitStatistics = require('./removeVisitStatistics');

const FROM_VERSION = 11;
const TO_VERSION = FROM_VERSION + 1;

// Steps to be executed with asyn.eachSeries in the given order.
// The parameter 'nextStep' is function (err) that must be called in the end of
// each step.
const substeps = [

  function updateSchema(nextStep) {
    console.log('1. Updating schema version tag...');

    schema.setVersion(TO_VERSION, (err) => {
      if (err) {
        return nextStep(err);
      }

      console.log('  Schema version tag created:', TO_VERSION);
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
        if (err.codeName === 'NamespaceNotFound') {
          console.log('  No attachments collection yet.');
          return nextStep();
        }
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
    console.log('5. Add published prop and remove visits prop in locations...');

    const coll = db.collection('locations');

    iter.updateEach(coll, (origLoc, iterNext) => {
      const loc = clone(origLoc);
      delete loc.visits;
      loc.published = false;
      return iterNext(null, loc);
    }, (err, iterResults) => {
      if (err) {
        return nextStep(err);
      }

      console.log('  ' + iterResults.numDocuments + ' locations processed ' +
        'successfully.');
      console.log('  ' + iterResults.numUpdated + ' locations updated, ' +
        (iterResults.numDocuments - iterResults.numUpdated) + ' did not ' +
        'need an update');

      return nextStep();
    });
  },

  // Add createdAt property to locations
  addCreatedAt,

  function addThumbnail(nextStep) {
    console.log('7. Add thumbnail to each location...');

    const coll = db.collection('locations');

    iter.updateEach(coll, (origLoc, iterNext) => {
      getThumbnail(origLoc._id, (err, attachment) => {
        if (err) {
          return iterNext(err);
        }

        const loc = clone(origLoc);

        if (attachment) {
          loc.thumbnail = attachment.key;
        } else {
          // No image attachment. Default path.
          loc.thumbnail = null;
        }

        return iterNext(null, loc);
      });
    }, (err, iterResults) => {
      if (err) {
        return nextStep(err);
      }

      console.log('  ' + iterResults.numDocuments + ' locations processed ' +
        'successfully.');
      console.log('  ' + iterResults.numUpdated + ' locations updated, ' +
        (iterResults.numDocuments - iterResults.numUpdated) + ' did not ' +
        'need an update');

      return nextStep();
    });
  },

  // Remove outdated statistics from users
  removeVisitStatistics,

  // Add activeAt property to entries
  addActiveAt,

];

exports.run = (callback) => {
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
