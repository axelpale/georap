const repairAttachment = require('./repairAttachment');
const asyn = require('async');
const db = require('georap-db');

module.exports = (entryId, callback) => {
  // Parameters
  //   entryId
  //     an ObjectId
  //   callback
  //     fn (err, statistics) where
  //       statistics
  //         { numRepaired, numAttachments }
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

        // Maybe in some weird situation the entry might be removed?
        if (!entry) {
          return next(new Error('Missing entry: ' + entryId));
        }

        return next(null, entry);
      });
    },

    // Find entry's attachments
    (entry, next) => {

      // Attachment keys and correct usernames
      const keysAndNames = []; // array of { key, username }

      entry.attachments.forEach((attKey) => {
        keysAndNames.push({
          key: attKey,
          username: entry.user,
        });
      });

      entry.comments.forEach((comment) => {
        comment.attachments.forEach((attKey) => {
          keysAndNames.push({
            key: attKey,
            username: comment.user,
          });
        });
      });

      // Now keysAndNames contains keys of all attachment associated with
      // the entry and names of their true authors.
      return next(null, keysAndNames);
    },

    // Update attachments
    (keysAndNames, next) => {
      // Track number of repairs. Not every attachment needs repair.
      let numRepaired = 0;
      asyn.eachSeries(keysAndNames, (keyname, nxt) => {
        return repairAttachment(keyname.key, keyname.username, (er, num) => {
          if (er) {
            return nxt(er);
          }
          numRepaired += num;
          return nxt();
        });
      }, (err) => {
        if (err) {
          return next(err);
        }
        return next(null, {
          numRepaired: numRepaired,
          numAttachments: keysAndNames.length,
        });
      });
    },

  ], (finalError, finalResults) => {
    if (finalError) {
      return callback(finalError);
    }

    return callback(null, finalResults);
  });
};
