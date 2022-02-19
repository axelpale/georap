const getLatestComplete = require('../dal/getLatestComplete');

module.exports = (req, res, next) => {
  // Latest active posts, regardless the location.
  // Activity includes post creation and comment creation.

  // NOTE skip and limit already validated by middleware
  getLatestComplete({
    skip: req.query.skip,
    limit: req.query.limit,
  }, (err, posts) => {
    if (err) {
      return next(err);
    }

    return res.json({
      entries: posts,
      // count: 0, // total number of posts remaining.
      // Because there is probably lots of posts, the total count
      // provides little value and thus we do not implement it at this point.
    });
  });
};
