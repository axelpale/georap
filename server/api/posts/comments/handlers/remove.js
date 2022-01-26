const postsDal = require('../../dal');
const status = require('http-status-codes');

module.exports = function (req, res, next) {
  const locationId = req.location._id;
  const locationName = req.location.name;
  const entry = req.entry;
  const username = req.user.name;
  const commentId = req.commentId;

  // Check if such comment exists. Consider it already removed if not.
  const commentToRemove = entry.comments.find((comment) => {
    return comment.id === commentId;
  });
  if (!commentToRemove) {
    return res.sendStatus(status.OK);
  }

  postsDal.removeLocationEntryComment({
    locationId: locationId,
    locationName: locationName,
    entry: entry, // NOTE full entry needed to determine activeAt
    username: username,
    commentId: commentId,
  }, (err) => {
    if (err) {
      return next(err);
    }
    return res.sendStatus(status.OK);
  });
};
