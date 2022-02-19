const status = require('http-status-codes');
const postsDal = require('../dal');
const flagMap = require('./compiledEntryFlags');
const resetThumbnail = require('../../locations/location/dal/resetThumbnail');

// eslint-disable-next-line max-statements
module.exports = (req, res, next) => {
  // Update entry.
  //
  const oldEntry = req.entry;
  const location = req.location;

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
    const msg = req.__('flag-req-not-met');
    return res.status(status.BAD_REQUEST).send(msg);
  }

  postsDal.changeLocationEntry({
    oldEntry: oldEntry,
    username: req.user.name, // in future, admins or moderators could edit.
    locationName: location.name,
    delta: delta,
  }, (err, changedEntry) => {
    if (err) {
      return next(err);
    }

    if (req.location.thumbnail) {
      // Location thumbnail already set.
      return res.json({
        entry: changedEntry,
      });
    }

    // Update the thumbnail
    resetThumbnail(req.location._id, (errt) => {
      if (errt) {
        return next(errt);
      }

      return res.json({
        entry: changedEntry,
      });
    });
  });
};
