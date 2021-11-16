const getLatestComplete = require('../dal/getLatestComplete');

module.exports = (req, res, next) => {
  // Latest active entries, regardless the location.
  // Activity includes entry creation and comment creation.

  // NOTE skip and limit already validated by middleware
  getLatestComplete({
    skip: req.query.skip,
    limit: req.query.limit,
  }, (err, entries) => {
    if (err) {
      return next(err);
    }

    return res.json({
      entries: entries,
      // count: 0, // total number of entries remaining.
      // Because there is probably lots of entries, the total count
      // provides little value and thus we do not implement it at this point.
    });
  });
};
