const db = require('georap-db');

module.exports = (callback) => {
  // Count comments in non-deleted posts
  //
  // Parameters:
  //   callback
  //     function (err, number)
  //
  db.collection('entries').aggregate([
    {
      $match: {
        deleted: false,
      },
    },
    {
      $project: {
        comments: {
          $size: '$comments',
        },
      },
    },
    {
      $group: {
        _id: null, // Group all
        commentsCount: {
          $sum: '$comments',
        },
      },
    },
  ]).toArray((err, docs) => {
    if (err) {
      return callback(err);
    }

    if (docs.length < 1) {
      // No posts yet.
      return 0;
    }

    return callback(null, docs[0].commentsCount);
  });
};
