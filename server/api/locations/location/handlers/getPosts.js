const getManyComplete = require('../../../posts/dal/getManyComplete');

module.exports = (req, res, next) => {
  // Get location posts with their attachments and urls completed.
  //

  getManyComplete({
    locationId: req.location._id,
    deleted: false,
  }, {
    // NOTE skip and limit already validated by middleware
    skip: req.query.skip,
    limit: req.query.limit + 1, // +1 to detect if there is more
  }, (err, posts) => {
    if (err) {
      return next(err);
    }

    // Hint if the client should show Load More button
    let moreAvailable = false;
    if (posts.length > req.query.limit) {
      moreAvailable = true;
    }

    // Remove the Load More detector
    const limitedPosts = posts.slice(0, req.query.limit);

    return res.json({
      entries: limitedPosts,
      more: moreAvailable,
    });
  });

};
