const entriesDal = require('../dal');
const purifyMarkdown = require('purify-markdown');
const config = require('tresdb-config');
const status = require('http-status-codes');

exports.create = (req, res, next) => {
  // Create a comment into entry

  const locationId = req.location._id;
  const locationName = req.location.name;
  const entryId = req.entryId;
  const username = req.user.name;
  const markdown = req.body.markdown.trim();
  let attachments = req.body.attachments;

  // Validate
  if (typeof markdown !== 'string' ||
      markdown.length < config.comments.minMessageLength ||
      markdown.length > config.comments.maxMessageLength) {
    const msg = 'Invalid comment markdown: ' + markdown;
    return res.status(status.BAD_REQUEST).send(msg);
  }
  if (typeof attachments !== 'object') {
    const msg = 'Invalid attachments array: ' + attachments;
    return res.status(status.BAD_REQUEST).send(msg);
  }

  if (attachments.length > 1) {
    attachments = attachments.slice(0, 1);
  }

  if (!attachments.every(atta => typeof atta === 'string')) {
    const msg = 'Invalid attachments array: ' + attachments;
    return res.status(status.BAD_REQUEST).send(msg);
  }

  entriesDal.createLocationEntryComment({
    locationId: locationId,
    locationName: locationName,
    entryId: entryId,
    username: username,
    markdown: purifyMarkdown(markdown).trim(),
    attachments: attachments,
  }, function (err) {
    if (err) {
      return next(err);
    }
    return res.sendStatus(status.OK);
  });
};

// eslint-disable-next-line max-statements
exports.change = function (req, res, next) {
  // Update comment
  const locationId = req.location._id;
  const locationName = req.location.name;
  const entryId = req.entry._id;
  const markdown = req.body.markdown.trim(); // trim for length check
  let attachments = req.body.attachments;

  // Allow only owners edit.
  if (req.user.name !== req.comment.user) {
    const info = 'Only owners can edit their comments.';
    return res.status(status.FORBIDDEN).send(info);
  }

  // Validate message length
  if (markdown && (typeof markdown !== 'string' ||
      markdown.length < config.comments.minMessageLength ||
      markdown.length > config.comments.maxMessageLength)) {
    return res.status(status.BAD_REQUEST).send('Invalid comment message.');
  }

  // Validate attachments. Ensure only single attachment.
  if (attachments && typeof attachments !== 'object') {
    return res.status(status.BAD_REQUEST).send('Invalid attachments');
  }
  // Cut excess
  if (attachments.length > 1) {
    attachments = attachments.slice(0, 1);
  }

  // Keep delta minimal
  const original = {};
  const delta = {};
  let filled = false;

  // Sanitize and ensure change
  if (markdown) {
    const oldmd = req.comment.markdown;
    const newmd = purifyMarkdown(markdown).trim();
    if (oldmd !== newmd) {
      original.markdown = oldmd;
      delta.markdown = newmd;
      filled = true;
    }
  }
  // Sanitize and ensure change
  if (attachments) {
    const oldat = req.comment.attachments;
    const newat = attachments;
    if (oldat.length === newat.length) {
      if (oldat.length === 1) {
        if (oldat[0] !== newat[0]) {
          // Attachment changed
          original.attachments = oldat;
          delta.attachments = newat;
          filled = true;
        }
        // same attachment, no change
      }
      // else len=0, no change
    } else {
      // different size, change
      original.attachments = oldat;
      delta.attachments = newat;
      filled = true;
    }
  }

  if (!filled) {
    return res.status(status.BAD_REQUEST).send('Missing parameters');
  }

  entriesDal.changeLocationEntryComment({
    username: req.user.name,
    locationId: locationId,
    locationName: locationName,
    entryId: entryId,
    commentId: req.comment.id,
    original: original,
    delta: delta,
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
