const db = require('georap-db');
const urls = require('georap-urls-server');

module.exports = (query, options, callback) => {
  // Get many entries completed with their attachments,
  // their comments' attachments, and urls.
  // Add also locationName prop.
  //
  // Parameters:
  //   query
  //     an object passed to $match aggregation phase.
  //   options, required object with optional properties:
  //     skip
  //       integer. Default to 0.
  //     limit
  //       integer. Default to 100.
  //     withLocations
  //       boolean. Join location for each entry. Default false.
  //   callback
  //     function (err, entries)
  //
  options = Object.assign({
    skip: 0,
    limit: 100,
    withLocations: false,
  }, options);

  // Piece-wise construction
  const pipeline = [];

  // Filter
  pipeline.push({
    $match: query,
  });

  // Sort
  pipeline.push({
    $sort: {
      time: -1, // most recent first
    },
  });

  // Skip & limit
  if (typeof options.skip === 'number' && typeof options.limit === 'number') {
    pipeline.push({
      // With pipelines, limit must contain skip
      $limit: options.skip + options.limit,
    }, {
      $skip: options.skip,
    });
  }

  // Join locations if wanted. Strip most fields to keep the response small.
  if (options.withLocations) {
    pipeline.push({
      $lookup: {
        from: 'locations',
        let: {
          locationId: '$locationId',
        },
        pipeline: [
          {
            $match: {
              // $expr is required to use $$<variable> syntax
              $expr: {
                $eq: ['$_id', '$$locationId'],
              },
            },
          },
          {
            $project: {
              name: true,
            },
          },
        ],
        as: 'location',
      },
    }, {
      // Extract the single location from the array
      $unwind: {
        path: '$location',
        // DEBUG preserveNullAndEmptyArrays: true,
      },
    });
  }

  pipeline.push(
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
    // Gather attachment objects. NOTE lookup does not preserve order.
    {
      $lookup: {
        from: 'attachments',
        localField: 'attachments',
        foreignField: 'key',
        as: 'entryAttachments',
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
    }
  );

  return db.collection('entries')
    .aggregate(pipeline)
    .toArray((err, entries) => {
      if (err) {
        return callback(err);
      }

      // Reducer to convert arrays to fast access dict
      const attReducer = (dict, att) => {
        dict[att.key] = att;
        return dict;
      };

      // Preserve attachment order and complete attachment URLs
      entries.forEach(entry => {
        // Gather entry attachments to a fast-access dict
        const atts = entry.entryAttachments.reduce(attReducer, {});
        entry.attachments = entry.attachments.map((attKey) => {
          const att = atts[attKey];
          // Complete url
          return urls.completeAttachment(att);
        });
        // Forget the temporary entry attachment array
        delete entry.entryAttachments;
      });

      // Complete comment attachment objects (cats) and their URLs
      entries.forEach(entry => {
        // Gather comment attachments to a fast-access dict
        const cats = entry.commentAttachments.reduce(attReducer, {});
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
