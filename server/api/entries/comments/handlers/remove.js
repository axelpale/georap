const entriesDal = require('../../dal');
const status = require('http-status-codes');

module.exports = function (req, res, next) {
  const locationId = req.location._id;
  const locationName = req.location.name;
  const entry = req.entry;
  const username = req.user.name;
  const commentId = req.commentId;

  // Allow only owners and admins to delete
  const isAdmin = req.user.role === 'admin';
  const isOwner = req.user.name === req.comment.user;

  if (!isAdmin && !isOwner) {
    const info = 'Only admins and comment author can edit the comment.';
    return res.status(status.FORBIDDEN).send(info);
  }

  // Check if such comment exists. Consider it already removed if not.
  const commentToRemove = entry.comments.find((comment) => {
    return comment.id === commentId;
  });
  if (!commentToRemove) {
    return res.sendStatus(status.OK);
  }

  entriesDal.removeLocationEntryComment({
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
