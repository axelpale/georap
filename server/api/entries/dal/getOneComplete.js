const db = require('tresdb-db');
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
        $lookup: {
          from: 'attachments',
          localField: 'attachments',
          foreignField: 'key',
          as: 'attachments',
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

      const entry = entries[0];

      // Complete attachment URLs
      entry.attachments = entry.attachments.map(urls.completeAttachment);

      return callback(null, entry);
    });
};
