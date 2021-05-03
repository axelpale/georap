const db = require('georap-db');

module.exports = (locationId, callback) => {
  // Search and select a thumbnail for location.
  //
  // Parameters
  //   locationId
  //   callback
  //     function (err, attachment)
  //       Where attachment is an image attachment or null if not found.
  //
  db.collection('entries')
    .aggregate([ // From /server/api/entries/dal/getAllOfLocationComplete
      {
        $match: {
          locationId: locationId,
          deleted: false,
        },
      },
      {
        $sort: {
          time: -1, // most recent first
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
        // No entries, no thumbnail
        return callback(null, null);
      }

      // Find most recent image attachment.
      let firstImage = null;
      for (let i = 0; i < entries.length; i += 1) {
        const atts = entries[i].attachments;
        for (let j = 0; j < atts.length; j += 1) {
          if (atts[j].mimetype.startsWith('image')) {
            firstImage = atts[j];
            break;
          }
        }
        if (firstImage) {
          break;
        }
      }

      if (!firstImage) {
        // No image attachments, no thumbnail
        return callback(null, null);
      }

      return callback(null, firstImage);
    });
};
