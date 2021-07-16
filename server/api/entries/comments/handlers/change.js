const entriesDal = require('../../dal');
const purifyMarkdown = require('purify-markdown');
const commentModel = require('georap-models').comment;
const config = require('georap-config');
const status = require('http-status-codes');

// eslint-disable-next-line max-statements
module.exports = function (req, res, next) {
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

  // Allow only fresh comments to be edited.
  const ageMs = commentModel.getAgeMs(req.comment);
  // Add two minutes to the configured limit so that a user who
  // is still allowed to open the edit form is also allowed
  // to submit the work with high probability.
  const second = 1000;
  const ageMargin = 120 * second;
  const maxAgeMs = ageMargin + (config.comments.secondsEditable * second);
  if (ageMs > maxAgeMs) {
    const info = 'Only fresh comments can be edited.';
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
  // Ensure has only keys
  if (!attachments.every(key => typeof key === 'string')) {
    const msg = 'Invalid attachments array: ' + attachments;
    return res.status(status.BAD_REQUEST).send(msg);
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
  }, (err) => {
    if (err) {
      return next(err);
    }
    return res.sendStatus(status.OK);
  });
};
