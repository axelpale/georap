const getLatestComplete = require('../dal/getLatestComplete');

module.exports = (req, res, next) => {
  // Latest entries in any location.

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
      count: 0, // TODO
    });
  });
};
