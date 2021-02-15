const createAttachments = require('./createAttachments');
const transformChangedEvent = require('./transformChangedEvent');
const replayEntry = require('./replayEntry');
const asyn = require('async');
const db = require('tresdb-db');
const _ = require('lodash');

module.exports = (entryId, callback) => {
  //

  asyn.waterfall([

    // Find entry
    (next) => {
      db.collection('entries').findOne({
        _id: entryId,
      }, (err, entry) => {
        if (err) {
          return next(err);
        }

        // Entry might be removed. This is an error
        // because orphan events are already removed.
        if (!entry) {
          return next(new Error('Missing entry: ' + entryId));
        }

        return next(null, entry);
      });
    },

    // Find entry's events
    (entry, next) => {
      db.collection('events')
        .find({
          locationId: entry.locationId,
          'data.entryId': entry._id,
        })
        .sort('time', 1)
        .toArray((err, events) => {
          if (err) {
            return next(err);
          }

          // Split events by their type.
          const entryCreatedEvs = events.filter(ev => {
            return ev.type === 'location_entry_created';
          });

          const entryChangedEvs = events.filter(ev => {
            return ev.type === 'location_entry_changed';
          });

          const entryRemovedEvs = events.filter(ev => {
            return ev.type === 'location_entry_removed';
          });

          // Ensure there are correct number of events.
          if (entryCreatedEvs.length !== 1) {
            const msg = 'None or multiple location_entry_created events ' +
              'for entry id: ' + entry._id;
            return next(new Error(msg));
          }

          // No location_entry_removed events should exist anymore.
          if (entryRemovedEvs.length > 0) {
            const msg = 'Unexpected location_entry_removed event ' +
              'for entry id: ' + entry._id;
            return next(new Error(msg));
          }

          return next(null, {
            entry: entry,
            entryCreatedEv: entryCreatedEvs[0],
            entryChangedEvs: entryChangedEvs,
            entryRemovedEv: entryRemovedEvs.length > 0
              ? entryRemovedEvs[0] : null,
          });
        });
    },

    // Capture attachments
    (payload, next) => {
      const entryAttachments = [];
      const crev = payload.entryCreatedEv;
      const chevs = payload.entryChangedEvs;

      if (crev.data.filepath) {
        entryAttachments.push({
          username: crev.user,
          time: crev.time,
          filepath: crev.data.filepath,
          mimetype: crev.data.mimetype,
          thumbfilepath: crev.data.thumbfilepath,
          thumbmimetype: crev.data.thumbmimetype,
        });
      }

      chevs.forEach((chev) => {
        if (chev.data.newFilepath) {
          if (chev.data.newFilepath !== chev.data.oldFilepath) {
            entryAttachments.push({
              username: chev.user,
              time: chev.time,
              filepath: chev.data.newFilepath,
              mimetype: chev.data.newMimetype,
              thumbfilepath: chev.data.newThumbfilepath,
              thumbmimetype: chev.data.newThumbmimetype,
            });
          }
        }
      });

      return next(null, Object.assign({}, payload, {
        entryAttachments: entryAttachments,
      }));
    },

    // Create attachments
    (payload, next) => {
      // Construct mapping from entry.data.filepath to attachment array
      // so that we can replace files in the entries and events with keys.
      const filepathToAttachments = {};

      asyn.eachSeries(payload.entryAttachments, (enAtta, eachNext) => {
        createAttachments(enAtta, (catErr, attachmentKeys) => {
          if (catErr) {
            return eachNext(catErr);
          }

          filepathToAttachments[enAtta.filepath] = attachmentKeys;
          return eachNext();
        });
      }, (eachErr) => {
        if (eachErr) {
          return next(eachErr);
        }

        return next(null, Object.assign({}, payload, {
          filepathToAttachments: filepathToAttachments,
        }));
      });
    },

    // Migrate location_entry_created
    (payload, next) => {
      const crev = payload.entryCreatedEv;

      let attachments = [];
      if (crev.data.filepath) {
        attachments = payload.filepathToAttachments[crev.data.filepath];
      }

      const newEntry = {
        _id: crev.data.entryId,
        locationId: crev.locationId,
        time: crev.time,
        user: crev.user,
        deleted: false,
        published: false,
        markdown: crev.data.markdown === null ? '' : crev.data.markdown,
        attachments: attachments,
        comments: [],
        flags: crev.data.isVisit ? ['visit'] : [],
      };

      const newCrev = {
        _id: crev._id,
        locationId: crev.locationId,
        locationName: crev.locationName,
        time: crev.time,
        user: crev.user,
        data: {
          entryId: crev.data.entryId,
          entry: newEntry,
        },
      };

      db.collection('events').replaceOne({
        _id: crev._id,
      }, newCrev, (repErr) => {
        if (repErr) {
          return next(repErr);
        }

        return next(null, Object.assign({}, payload, {
          newEntryCreatedEv: newCrev,
        }));
      });
    },

    // Migrate location_entry_changed
    (payload, next) => {
      const newEntryChangedEvs = payload.entryChangedEvs.map((chev) => {
        return transformChangedEvent(chev, payload.filepathToAttachments);
      });

      return next(null, Object.assign({}, payload, {
        newEntryChangedEvs: newEntryChangedEvs,
      }));
    },

    // Migrate entry
    (payload, next) => {
      const oldEntry = payload.entry;

      let attachments = [];
      if (oldEntry.data.filepath) {
        attachments = payload.filepathToAttachments[oldEntry.data.filepath];
      }

      const newEntry = {
        _id: oldEntry._id,
        locationId: oldEntry.locationId,
        time: oldEntry.time,
        user: oldEntry.user,
        deleted: false,
        published: false,
        markdown: oldEntry.data.markdown ? oldEntry.data.markdown : '',
        attachments: attachments,
        comments: oldEntry.comments,
        flags: oldEntry.data.isVisit ? ['visit'] : [],
        // NOTE failed overlay property is dropped
      };

      db.collection('entries').replaceOne({
        _id: oldEntry._id,
      }, newEntry, (repErr) => {
        if (repErr) {
          return next(repErr);
        }

        return next(null, Object.assign({}, payload, {
          newEntry: newEntry,
        }));
      });
    },

    // Test integrity: Replay new events to ensure same result
    (payload, next) => {
      const replayedEntry = replayEntry(
        payload.newEntryCreatedEv,
        payload.newEntryChangedEvs,
        payload.oldEntry.comments
      );

      if (!_.isEqual(replayedEntry, payload.newEntry)) {
        const msg = 'Inconsistent entry creation detected for ' +
          'entry id: ' + entryId;
        return next(new Error(msg));
      }

      return next(null, payload);
    },

  ], (finalError, finalResult) => {
    if (finalError) {
      return callback(finalError);
    }

    return callback(null, finalResult);
  });
};
