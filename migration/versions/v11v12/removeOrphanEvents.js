// Until now, we have removed entries by deleting them from the database.
//
const db = require('tresdb-db');
const asyn = require('async');

module.exports = (callback) => {
  const enColl = db.collection('entries');
  const evColl = db.collection('events');

  // Track how many events are removed. Brings confidence for the migrator.
  let numRemoved = 0;

  asyn.waterfall([

    // Get all relevant event ids
    (nextTask) => {
      evColl.find({
        type: {
          $in: [
            'location_entry_created',
            'location_entry_changed',
            'location_entry_removed',
          ],
        },
      }).project({
        _id: 1,
      }).toArray((err, idEvs) => {
        if (err) {
          return nextTask(err);
        }

        return nextTask(null, idEvs);
      });
    },

    // For each event id:
    (idEvs, nextTask) => {
      // First get the event
      asyn.eachSeries(idEvs, (idEv, nextEvent) => {
        evColl.findOne({ _id: idEv._id }, (ferr, ev) => {
          if (ferr) {
            return nextEvent(ferr);
          }

          // Then try to get entry.
          const entryId = ev.data.entryId;
          enColl.findOne({ _id: entryId }, (enerr, entry) => {
            if (enerr) {
              return nextEvent(enerr);
            }

            if (entry) {
              // Found. Everything in order, no need to delete events.
              return nextEvent();
            }

            // Entry not found. Remove the event.
            evColl.deleteOne({ _id: idEv._id }, (derr) => {
              if (derr) {
                return nextEvent(derr);
              }
              numRemoved += 1;
              return nextEvent();
            });
          });
        });
      }, (eachErr) => {
        if (eachErr) {
          return nextTask(eachErr);
        }

        // The events dealt with.
        return nextTask();
      });
    },

    // No further tasks.
  ], (taskErr, taskResult) => {
    if (taskErr) {
      return callback(taskErr);
    }
    // Success. Return with the number of events removed.
    return callback(null, numRemoved);
  });
};
