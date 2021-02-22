const db = require('tresdb-db');
const asyn = require('async');
const attachmentsDal = require('../../attachments/dal');
const lib = require('./lib');

module.exports = (params, callback) => {
  // Notify about changed entry
  //
  // Parameters:
  //   params:
  //     entryId
  //       string
  //     locationId
  //       string
  //     locationName
  //       string
  //     delta
  //       object of changed values
  //     original
  //       object of original values
  //
  if (typeof params.oldEntry._id !== 'object') {
    throw new Error('Invalid entry id type: ' + typeof params.oldEntry._id);
  }

  const newEvent = {
    type: 'location_entry_changed',
    user: params.oldEntry.user,
    time: db.timestamp(),
    locationId: params.locationId,
    locationName: params.locationName,
    data: {
      entryId: params.oldEntry._id,
      original: params.original,
      delta: params.delta,
    },
  };

  // Insert the basic version and emit an extended version
  // with complete attachments (if needed).
  lib.insertOne(newEvent, (err, newId) => {
    if (err) {
      return callback(err);
    }

    // Clone and fill id
    const eventForEmit = Object.assign({}, newEvent, {
      _id: newId,
    });

    // Convert attachment keys to attachments.
    // This prevents additional requests from clients.
    asyn.waterfall([

      (next) => {
        if (params.original.attachments) {
          attachmentsDal.getMany(params.original.attachments, (merr, cats) => {
            if (merr) {
              return next(merr);
            }
            eventForEmit.data.original.attachments = cats;
            return next();
          });
        } else {
          return next();
        }
      },

      (next) => {
        if (params.delta.attachments) {
          attachmentsDal.getMany(params.delta.attachments, (merr, cats) => {
            if (merr) {
              return next(merr);
            }
            eventForEmit.data.delta.attachments = cats;
            return next();
          });
        } else {
          return next();
        }
      },

    ], (finalErr) => {
      if (finalErr) {
        return callback(finalErr);
      }

      // Emit the extended version.
      lib.emitOne(eventForEmit);

      // TODO maybe outside waterfall?
      return callback();
    });
  });
};
