const status = require('http-status-codes');
const entriesDal = require('../dal');
const flagMap = require('./compiledEntryFlags');
const resetThumbnail = require('../../locations/location/dal/resetThumbnail');

module.exports = (req, res, next) => {
  // Create entry.
  //
  const locationId = req.location._id;
  const locationName = req.location.name;
  const username = req.user.name;

  const entryData = req.body.entryData;
  if (!entryData) {
    return res.status(status.BAD_REQUEST).send('Missing entryData');
  }

  // Complete and sanitize entryData
  if ('markdown' in entryData) {
    entryData.markdown = entryData.markdown.trim();
  } else {
    entryData.markdown = '';
  }

  if ('attachments' in entryData && typeof entryData.attachments === 'object') {
    // noop. Maybe sanitize here in future.
  } else {
    entryData.attachments = [];
  }

  if ('flags' in entryData && typeof entryData.flags === 'object') {
    // noop. Maybe sanitize here in future.
  } else {
    entryData.flags = [];
  }

  // Do not allow empty posts
  if (entryData.markdown === '' && entryData.attachments.length === 0) {
    return res.status(status.BAD_REQUEST).send('Empty posts are not allowed.');
  }

  // Do not allow non-configured flags. Ensure every flag is configured.
  // NOTE [].every(...) is always true
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

  entriesDal.createLocationEntry({
    locationId: locationId,
    locationName: locationName,
    username: username,
    markdown: entryData.markdown,
    attachments: entryData.attachments,
    flags: entryData.flags,
  }, (err, entry) => {
    if (err) {
      return next(err);
    }

    if (req.location.thumbnail) {
      // Location thumbnail already set.
      return res.json({
        entry: entry,
      });
    }

    // Update the thumbnail
    resetThumbnail(locationId, (errt) => {
      if (errt) {
        return next(errt);
      }

      return res.json({
        entry: entry,
      });
    });
  });
};
