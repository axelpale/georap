// In this version increase:
// 1. set schema version to 13
// 2. repair attachment usernames by going through entries and comments
//
// This migrate step is config independent.
//
// Also, new indices were made and thus 'npm run migrate' is needed.
//

const db = require('georap-db');
const asyn = require('async');
const schema = require('../../lib/schema');
const repairEntryAttachments = require('./repairEntryAttachments');

const FROM_VERSION = 12;
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

  function refactorEntries(nextStep) {
    console.log('2. Repair attachment usernames...');

    db.collection('entries')
      .find()
      .project({
        _id: 1,
      })
      .toArray((err, entryIds) => {
        if (err) {
          return nextStep(err);
        }

        // Collect statistics to display at the end of repair.
        let numAtts = 0;
        let numAttsRepaired = 0;

        asyn.eachSeries(entryIds, (wrappedEntryId, eachNext) => {
          repairEntryAttachments(wrappedEntryId._id, (errr, statistics) => {
            if (errr) {
              return eachNext(errr);
            }
            numAtts += statistics.numAttachments;
            numAttsRepaired += statistics.numRepaired;
            return eachNext();
          });
        }, (eachErr) => {
          if (eachErr) {
            return nextStep(eachErr);
          }
          console.log('  ' + numAttsRepaired + ' attachments were repaired.');
          console.log('  ' + numAtts + ' attachments in total.');
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

  asyn.series(substeps, (err) => {
    if (err) {
      console.error(err);
      return callback(err);
    }

    return callback();
  });
};
