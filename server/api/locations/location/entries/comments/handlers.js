var entriesDal = require('../../../../entries/dal');
var config = require('tresdb-config');
var status = require('http-status-codes');

exports.create = function (req, res, next) {
  // Create a comment into entry

  var locationId = req.location._id;
  var locationName = req.location.name;
  var entryId = req.entryId;
  var username = req.user.name;
  var message = req.body.message;

  // Validate
  if (typeof message !== 'string' ||
      message.length < config.comments.minMessageLength ||
      message.length > config.comments.maxMessageLength) {
    return res.status(status.BAD_REQUEST).send('Invalid comment message.');
  }

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

  // Validate message length
  if (typeof newMessage !== 'string' ||
      newMessage.length < config.comments.minMessageLength ||
      newMessage.length > config.comments.maxMessageLength) {
    return res.status(status.BAD_REQUEST).send('Invalid comment message.');
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
