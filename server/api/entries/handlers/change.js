const status = require('http-status-codes');
const entriesDal = require('../dal');
const flagMap = require('./compiledEntryFlags');

// eslint-disable-next-line max-statements
module.exports = (req, res, next) => {
  // Update entry.
  //
  const oldEntry = req.entry;
  const location = req.location;

  // Allow only creator or admin to edit.
  // TODO make a difference between editor and owner
  if (req.user.name !== oldEntry.user && req.user.admin === false) {
    return res.sendStatus(status.FORBIDDEN);
  }

  const dirtyDelta = req.body.entryData;
  if (!dirtyDelta) {
    return res.status(status.BAD_REQUEST).send('Missing entryData');
  }

  // Gather sanitized entry data here
  const delta = {};
  let diff = false; // if delta has some content

  if ('markdown' in dirtyDelta) {
    delta.markdown = dirtyDelta.markdown.trim();
    diff = true;
  }

  if ('attachments' in dirtyDelta && Array.isArray(dirtyDelta.attachments)) {
    delta.attachments = dirtyDelta.attachments;
    diff = true;
  }

  if ('flags' in dirtyDelta && typeof dirtyDelta.flags === 'object') {
    delta.flags = dirtyDelta.flags;
    diff = true;
  }

  if (!diff) {
    return res.status(status.BAD_REQUEST).send('Nothing to change');
  }

  // Preassign for validation only. Pass only delta to dal.
  const entryData = {
    markdown: ('markdown' in delta)
      ? delta.markdown : oldEntry.markdown,
    attachments: ('attachments' in delta)
      ? delta.attachments : oldEntry.attachments,
    flags: ('flags' in delta)
      ? delta.flags : oldEntry.flags,
  };

  // Do not allow empty posts
  if (entryData.markdown === '' && entryData.attachments.length === 0) {
    return res.status(status.BAD_REQUEST).send('Empty posts are not allowed.');
  }

  // Do not allow non-configured flags. Ensure every flag is configured.
  const flagsValid = entryData.flags.every((flagName) => {
    return flagName in flagMap;
  });
  if (!flagsValid) {
    const msg = 'Unknown flags detected in ' + JSON.stringify(entryData.flags);
    return res.status(status.BAD_REQUEST).send(msg);
  }

  // Check flag preconditions against the entryData
  const preconditionsMet = entryData.flags.every((flagName) => {
    const validate = flagMap[flagName].validatePrecondition;
    return validate(entryData);
  });
  if (!preconditionsMet) {
    const msg = 'Requirements of some flags were not met.';
    return res.status(status.BAD_REQUEST).send(msg);
  }

  entriesDal.changeLocationEntry({
    oldEntry: oldEntry,
    username: req.user.name, // in future, admins or moderators could edit.
    locationName: location.name,
    delta: delta,
  }, (err, changedEntry) => {
    if (err) {
      return next(err);
    }
    return res.json({
      entry: changedEntry,
    });
  });
};
