const status = require('http-status-codes');
const dal = require('./dal');
const db = require('tresdb-db');
const config = require('tresdb-config');
const Ajv = require('ajv');

// Precompile flag precondition validators.
// The preconditions use json schemas.
// Also gather flags into object for simpler validation code in handlers.
const ajv = new Ajv();
const flagMap = Object.keys(config.entryFlags).reduce((acc, flagName) => {
  const schema = config.entryFlags[flagName].precondition;
  acc[flagName] = {
    name: flagName,
    validatePrecondition: ajv.compile(schema),
  };
  return acc;
}, {});

exports.getLatest = (req, res) => {
  return res.json({
    entries: [],
    count: 0,
  });
};

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

  dal.changeLocationEntry({
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

exports.create = (req, res, next) => {
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

  dal.createLocationEntry({
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
    return res.json({
      entry: entry,
    });
  });
};

exports.move = (req, res, next) => {
  // Move entry to another location
  //
  const locationId = req.location._id;
  const locationName = req.location.name;
  const username = req.user.name;
  const entry = req.entry;
  const toLocationIdCandidate = req.body.toLocationId;

  // Ensure proper object id
  let toLocationId;
  try {
    toLocationId = db.id(toLocationIdCandidate);
  } catch (e) {
    return res.status(status.BAD_REQUEST).send('Invalid target location id');
  }

  dal.moveLocationEntry({
    locationId: locationId,
    locationName: locationName,
    toLocationId: toLocationId,
    entryId: entry._id,
    username: username,
  }, (err) => {
    if (err) {
      if (err.name === 'NOT_FOUND') {
        const msg = 'Target location not found';
        return res.status(status.BAD_REQUEST).send(msg);
      }
      return next(err);
    }
    return res.sendStatus(status.OK);
  });
};

exports.remove = (req, res, next) => {
  // Remove entry by setting deleted:true

  const locationId = req.location._id;
  const locationName = req.location.name;
  const username = req.user.name;
  const entry = req.entry;

  dal.removeLocationEntry({
    locationId: locationId,
    locationName: locationName,
    entryId: entry._id,
    username: username,
    entry: entry,
  }, (err) => {
    if (err) {
      return next(err);
    }
    return res.sendStatus(status.OK);
  });
};
