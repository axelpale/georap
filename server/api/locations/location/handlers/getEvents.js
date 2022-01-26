const getEvents = require('../dal/getEvents');

module.exports = (req, res, next) => {
  // Get location posts with their attachments and urls completed.
  //
  const locId = req.location._id;

  getEvents({
    locationId: locId,
    // NOTE skip and limit already validated by middleware
    skip: req.query.skip,
    limit: req.query.limit + 1, // +1 to detect if there is more
  }, (err, events) => {
    if (err) {
      return next(err);
    }

    // Hint if the client should show Load More button
    let moreAvailable = false;
    if (events.length > req.query.limit) {
      moreAvailable = true;
    }

    // Remove the Load More detector row
    const limitedEvents = events.slice(0, req.query.limit);

    return res.json({
      locationId: locId,
      events: limitedEvents,
      more: moreAvailable,
    });
  });
};
