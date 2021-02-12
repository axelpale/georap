const _ = require('lodash');
const status = require('http-status-codes');
const dal = require('../../../entries/dal');

// eslint-disable-next-line max-statements
exports.change = (req, res, next) => {
  // Update entry.
  //
  const oldEntry = req.entry;
  const location = req.location;

  // Allow only creator or admin to edit.
  // TODO make a difference between editor and owner
  if (req.user.name !== oldEntry.user && req.user.admin === false) {
    return res.sendStatus(status.FORBIDDEN);
  }

  const delta = {};
  let diff = false; // if delta has some content

  if ('entrytext' in req.body) {
    delta.markdown = req.body.entrytext.trim();
    diff = true;
  }

  if ('attachments' in req.body && typeof req.body.attachments === 'object') {
    delta.attachments = req.body.attachments;
    diff = true;
  }

  if ('flags' in req.body && typeof req.body.flags === 'object') {
    delta.flags = req.body.flags;
    diff = true;
  }

  if (!diff) {
    return res.status(status.BAD_REQUEST).send('Nothing to change');
  }

  // Preassign for validation only. Pass only delta to dal.
  const markdown = ('markdown' in delta)
    ? delta.markdown : oldEntry.markdown;
  const attachments = ('attachments' in delta)
    ? delta.attachments : oldEntry.attachments;
  const flags = ('flags' in delta)
    ? delta.flags : oldEntry.flags;

  // Do not allow empty posts
  if (markdown === '' && attachments.length === 0) {
    return res.status(status.BAD_REQUEST).send('Empty posts are not allowed.');
  }

  // Check possible conditions for flags
  // TODO make configurable
  // Visit is only regarded with a file for proof.
  if (flags.indexOf('visit') >= 0 && attachments.length === 0) {
    delta.flags = _.without(flags, 'visit');
  }

  dal.changeLocationEntry({
    oldEntry: oldEntry,
    locationName: location.name,
    delta: delta,
  }, (err, changedEntry) => {
    if (err) {
      return next(err);
    }
    return res.json(changedEntry);
  });
};


exports.create = (req, res, next) => {
  // Create entry.
  //
  const locationId = req.location._id;
  const locationName = req.location.name;
  const username = req.user.name;

  let markdown, attachments, flags;

  if ('entrytext' in req.body) {
    markdown = req.body.entrytext.trim();
  } else {
    markdown = '';
  }

  if ('attachments' in req.body && typeof req.body.attachments === 'object') {
    attachments = req.body.attachments;
  } else {
    attachments = [];
  }

  if ('flags' in req.body && typeof req.body.flags === 'object') {
    flags = req.body.flags;
  } else {
    flags = [];
  }

  // Do not allow empty posts
  if (markdown === '' && attachments.length === 0) {
    return res.status(status.BAD_REQUEST).send('Empty posts are not allowed.');
  }

  // Check possible conditions for flags
  // TODO make configurable
  // Visit is only regarded with a file for proof.
  if (flags.indexOf('visit') >= 0 && attachments.length === 0) {
    flags = _.without(flags, 'visit');
  }

  dal.createLocationEntry({
    locationId: locationId,
    locationName: locationName,
    username: username,
    markdown: markdown,
    attachments: attachments,
    flags: flags,
  }, (err, entry) => {
    if (err) {
      return next(err);
    }
    return res.json({
      entry: entry,
    });
  });
};


exports.remove = (req, res, next) => {
  // Remove entry from db

  const locationId = req.location._id;
  const locationName = req.location.name;
  const entryId = req.entry._id;
  const username = req.user.name;

  dal.removeLocationEntry({
    locationId: locationId,
    locationName: locationName,
    entryId: entryId,
    username: username,
  }, (err) => {
    if (err) {
      return next(err);
    }
    return res.sendStatus(status.OK);
  });
};
