const entriesDal = require('../../dal');
const purifyMarkdown = require('purify-markdown');
const status = require('http-status-codes');
const config = require('georap-config');

module.exports = (req, res, next) => {
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

  if (!attachments.every(key => typeof key === 'string')) {
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
  }, (err) => {
    if (err) {
      return next(err);
    }
    return res.sendStatus(status.OK);
  });
};
