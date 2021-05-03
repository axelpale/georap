const db = require('georap-db');
const urls = require('georap-urls-server');

module.exports = (entryId, callback) => {
  // Find single entry with attachments.
  // Expand their URLs.
  //
  return db.collection('entries')
    .aggregate([
      {
        $match: {
          _id: entryId,
        },
      },
      {
        // NOTE lookup does not preserve local array order
        $lookup: {
          from: 'attachments',
          localField: 'attachments',
          foreignField: 'key',
          as: 'entryAttachments',
        },
      },
    ])
    .toArray((err, entries) => {
      if (err) {
        return callback(err);
      }

      if (entries.length === 0) {
        return callback(null, null);
      }

      // Unwrap the single entry.
      const entry = entries[0];

      // Preserve attachment order and complete attachment URLs.
      // First, put attachments into fast-access dict.
      const attDict = entry.entryAttachments.reduce((acc, att) => {
        acc[att.key] = att;
        return acc;
      }, {});
      // Then replace the keys with objects and also complete url.
      entry.attachments = entry.attachments.map((attKey) => {
        const att = attDict[attKey];
        return urls.completeAttachment(att);
      });
      // Finally, forget the temporary array
      delete entry.entryAttachments;

      return callback(null, entry);
    });
};
