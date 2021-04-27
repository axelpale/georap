const db = require('tresdb-db');
const urls = require('georap-urls-server');

module.exports = (query, range, callback) => {
  // Get many entries completed with their attachments,
  // their comments' attachments, and urls.
  //
  // Parameters:
  //   query
  //     an object passed to $match aggregation phase.
  //   range
  //     skip
  //     limit
  //   callback
  //     function (err, entries)
  //

  return db.collection('entries')
    .aggregate([
      {
        $match: query,
      },
      {
        $sort: {
          time: -1, // most recent first
        },
      },
      {
        $limit: range.skip + range.limit, // pipeline limit must contain skip
      },
      {
        $skip: range.skip,
      },
      // Collect attachment keys from comments for further processing.
      // NOTE $concatArrays cannot be used to concatenate already nested arrays
      // such as the one returned by '$comments.attachments'
      {
        $addFields: {
          commentAttachments: {
            $reduce: {
              input: '$comments.attachments',
              initialValue: [],
              in: {
                $concatArrays: ['$$value', '$$this'],
              },
            },
          },
        },
      },
      // Replace attachment keys with attachment objects
      {
        $lookup: {
          from: 'attachments',
          localField: 'attachments',
          foreignField: 'key',
          as: 'attachments',
        },
      },
      // Replace gathered comment attachment keys with attachment objects
      {
        $lookup: {
          from: 'attachments',
          localField: 'commentAttachments',
          foreignField: 'key',
          as: 'commentAttachments',
        },
      },
    ]).toArray((err, entries) => {
      if (err) {
        return callback(err);
      }

      // Complete attachment URLs
      entries.forEach(entry => {
        entry.attachments = entry.attachments.map(urls.completeAttachment);
      });

      // Complete comment attachment objects and their URLs
      const catReducer = (dict, cat) => {
        dict[cat.key] = cat;
        return dict;
      };
      entries.forEach(entry => {
        // Gather comment attachments to a fast-access dict
        const cats = entry.commentAttachments.reduce(catReducer, {});
        // Replace in-comment attachment keys with attachment objects.
        entry.comments.forEach((comment) => {
          comment.attachments = comment.attachments.map((catKey) => {
            const cat = cats[catKey];
            // Complete url
            return urls.completeAttachment(cat);
          });
        });
        // Forget the temporary cats array
        delete entry.commentAttachments;
      });

      return callback(null, entries);
    });
};
