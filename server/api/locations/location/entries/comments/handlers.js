var entriesDal = require('../../../../entries/dal');
var status = require('http-status-codes');

exports.create = function (req, res, next) {
  // Create a comment into entry

  var locationId = req.location._id;
  var locationName = req.location.name;
  var entryId = req.entryId;
  var username = req.user.name;
  var message = req.body.message;

  entriesDal.createLocationEntryComment({
    locationId: locationId,
    locationName: locationName,
    entryId: entryId,
    username: username,
    message: message,
  }, function (err) {
    if (err) {
      return next(err);
    }
    return res.sendStatus(status.OK);
  });
};

exports.change = function (req, res, next) {
  // Update comment
  var locationId = req.location._id;
  var locationName = req.location.name;
  var entryId = req.entry._id;
  var currentUsername = req.user.name;
  var commentId = req.comment.id;
  var newMessage = req.body.newMessage;

  // Allow only owners edit.
  if (currentUsername !== req.comment.user) {
    var info = 'Only owners can edit their comments.';
    return res.status(status.FORBIDDEN).send(info);
  }

  entriesDal.changeLocationEntryComment({
    username: currentUsername,
    locationId: locationId,
    locationName: locationName,
    entryId: entryId,
    commentId: commentId,
    newMessage: newMessage,
  }, function (err) {
    if (err) {
      return next(err);
    }
    return res.sendStatus(status.OK);
  });
};

exports.remove = function (req, res, next) {
  var locationId = req.location._id;
  var locationName = req.location.name;
  var entryId = req.entryId;
  var username = req.user.name;
  var commentId = req.commentId;

  // Allow only owners and admins to delete
  var isAdmin = req.user.admin;
  var isOwner = req.user.name === req.comment.user;

  if (isAdmin || isOwner) {
    entriesDal.removeLocationEntryComment({
      locationId: locationId,
      locationName: locationName,
      entryId: entryId,
      username: username,
      commentId: commentId,
    }, function (err) {
      if (err) {
        return next(err);
      }
      return res.sendStatus(status.OK);
    });
  } else {
    var info = 'Only admins and comment author can edit the comment.';
    return res.status(status.FORBIDDEN).send(info);
  }
};
