const createAttachments = require('./createAttachments');
const asyn = require('async');
const db = require('tresdb-db');

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
      db.collection('events').find({
        locationId: entry.locationId,
        'data.entryId': entry._id,
      }).sort([[time: 1]]).toArray((err, events) => {
        if (err) {
          return next(err);
        }

        // Split events by their type.
        entryCreatedEvs = events.filter(ev => {
          return ev.type === 'location_entry_created';
        });

        entryChangedEvs = events.filter(ev => {
          return ev.type === 'location_entry_changed';
        });

        entryRemovedEvs = events.filter(ev => {
          return ev.type === 'location_entry_removed';
        });

        // Ensure there are correct number of events.
        if (entryCreatedEvs.length !== 1) {
          const msg = 'None or multiple location_entry_created events ' +
            'for entry id: ' + entry._id;
          return next(new Error(msg));
        }
        if (entryRemovedEvs.length > 1) {
          const msg = 'Multiple location_entry_removed events ' +
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
      // Construct entry.data.filepath to attachment key
      // so that we can replace files in the entries and events with keys.
      const filepathToKey = {};

      asyn.eachSeries(payload.entryAttachments, (enAtta, eachNext) => {
        createAttachments(enAtta, (catErr, attachmentKeys) => {
          if (catErr) {
            return eachNext(catErr);
          }

          // 0 to 1 keys
          attachmentKeys.forEach(key => {
            filepathToKey[enAtta.filepath] = key;
          });

          return eachNext();
        });
      }, (eachErr, eachResult) => {
        if (eachErr) {
          return next(eachErr);
        }

        return next(null, Object.assign({}, payload, {
          filepathToKey: filepathToKey,
        }));
      });
    },

    // Migrate location_entry_created
    (payload, next) => {
      const crev = payload.entryCreatedEv;

      const attachments = [];
      if (crev.data.filepath) {
        const key = payload.filepathToKey[crev.data.filepath];
        if (key) {
          attachments.push(key);
        }
      }

      const newEntry = {
        _id: crev.data.entryId,
        locationId: crev.locationId,
        time: crev.time,
        user: crev.user,
        deleted: false,
        published: false,
        markdown: crev.data.markdown,
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
        });
      });
    },

    // Migrate location_entry_changed
    (payload, next) => {

    },

    // Migrate location_entry_removed
    (payload, next) => {

    },

    // Migrate entry
    (payload, next) => {

    },

  ], (finalError, finalResult) => {

  });



  transform entry
  place latest attachment

  replay events to build entry
  compare


};
