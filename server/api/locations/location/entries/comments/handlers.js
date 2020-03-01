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
  var entryId = req.entryId;
  var username = req.user.name;
  var commentId = req.body.commentId;
  var newMessage = req.body.newMessage;

  entriesDal.changeLocationEntryComment({
    username: username,
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
};
