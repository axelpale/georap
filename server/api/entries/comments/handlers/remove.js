const entriesDal = require('../../dal');
const able = require('georap-able').isAble;
const status = require('http-status-codes');

module.exports = function (req, res, next) {
  const locationId = req.location._id;
  const locationName = req.location.name;
  const entry = req.entry;
  const username = req.user.name;
  const commentId = req.commentId;

  // Allow only owners and privileged users to delete
  const isGod = able(req.user, 'comments-delete-any');
  const isOwner = req.user.name === req.comment.user;
  const isOwnerAllowed = isOwner && able(req.user, 'comments-delete-own');
  const isAllowed = isGod || isOwnerAllowed;

  if (!isAllowed) {
    return res.sendStatus(status.FORBIDDEN);
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
