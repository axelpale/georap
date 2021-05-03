const createAttachments = require('./createAttachments');
const captureAttachments = require('./captureAttachments');
const migrateCommentCreated = require('./migrateCommentCreated');
const migrateCommentChanged = require('./migrateCommentChanged');
const migrateEntryCreated = require('./migrateEntryCreated');
const transformChangedEvent = require('./transformChangedEvent');
const transformComments = require('./transformComments');
const replayEntry = require('./replayEntry');
const asyn = require('async');
const db = require('georap-db');
const _ = require('lodash');

module.exports = (entryId, callback) => {
  // Parameters
  //   entryId
  //     an ObjectId
  //   callback
  //     migration payload object
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

          const commentCreatedEvs = events.filter(ev => {
            return ev.type === 'location_entry_comment_created';
          });

          const commentChangedEvs = events.filter(ev => {
            return ev.type === 'location_entry_comment_changed';
          });

          const commentRemovedEvs = events.filter(ev => {
            return ev.type === 'location_entry_comment_removed';
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
            commentCreatedEvs: commentCreatedEvs,
            commentChangedEvs: commentChangedEvs,
            commentRemovedEvs: commentRemovedEvs,
          });
        });
    },

    // Capture attachments
    (payload, next) => {
      return next(null, Object.assign({}, payload, {
        entryAttachments: captureAttachments(
          payload.entryCreatedEv,
          payload.entryChangedEvs
        ),
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
      migrateEntryCreated(
        payload.entryCreatedEv,
        payload.filepathToAttachments,
        payload.entry.time,
        (err, newEvent) => {
          if (err) {
            return next(err);
          }

          return next(null, Object.assign({}, payload, {
            newEntryCreatedEv: newEvent,
          }));
        }
      );
    },

    // Migrate location_entry_changed
    (payload, next) => {
      const newEntryChangedEvs = payload.entryChangedEvs.map((chev) => {
        return transformChangedEvent(chev, payload.filepathToAttachments);
      });

      // Replace each
      asyn.eachSeries(newEntryChangedEvs, (newChev, nextEach) => {
        db.collection('events').replaceOne({
          _id: newChev._id,
        }, newChev, nextEach);
      }, (eachErr) => {
        if (eachErr) {
          return next(eachErr);
        }

        return next(null, Object.assign({}, payload, {
          newEntryChangedEvs: newEntryChangedEvs,
        }));
      });
    },

    // Migrate location_entry_comment_created
    // to contain the full comment object
    (payload, next) => {
      migrateCommentCreated(payload.commentCreatedEvs, (err, newEvs) => {
        if (err) {
          return next(err);
        }
        return next(null, Object.assign({}, payload, {
          newCommentCreatedEvs: newEvs,
        }));
      });
    },

    // Migrate location_entry_comment_changed
    (payload, next) => {
      migrateCommentChanged(payload.commentChangedEvs, (err, newEvs) => {
        if (err) {
          return next(err);
        }
        return next(null, Object.assign({}, payload, {
          newCommentChangedEvs: newEvs,
        }));
      });
    },

    // No need to migrate location_entry_comment_removed

    // Migrate entry
    (payload, next) => {
      const oldEntry = payload.entry;

      let attachments = [];
      if (oldEntry.data.filepath) {
        attachments = payload.filepathToAttachments[oldEntry.data.filepath];
      }

      const newEntry = {
        _id: oldEntry._id,
        activeAt: oldEntry.time, // correct activeAt set later in migration
        locationId: oldEntry.locationId,
        time: oldEntry.time,
        user: oldEntry.user,
        deleted: false,
        published: false,
        markdown: oldEntry.data.markdown ? oldEntry.data.markdown : '',
        attachments: attachments,
        comments: transformComments(oldEntry.comments),
        flags: oldEntry.data.isVisit ? ['visit'] : [],
        // NOTE failed overlay property is dropped
        // NOTE type property is dropped
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
        transformComments(payload.entry.comments)
      );

      if (!_.isEqual(replayedEntry, payload.newEntry)) {
        const msg = 'Inconsistent entry creation detected for ' +
          'entry id: ' + entryId;
        console.log('Migrated entry:', payload.newEntry);
        console.log('Replayed entry:', replayedEntry);
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
