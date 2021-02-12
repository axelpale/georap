const _ = require('lodash');
const status = require('http-status-codes');
const uploads = require('../../../../services/uploads');
const dal = require('../../../entries/dal');

// Setup
const uploadHandler = uploads.uploader.single('entryfile');

exports.change = (req, res, next) => {
  // Update entry.
  //
  // File is optional.

  const entryId = req.entryId;
  const location = req.location;

  // Editor vs creator. TODO make a difference between
  // var username = req.user.name;

  const then = (err) => {
    if (err) {
      return next(err);
    }
    return res.sendStatus(status.OK);
  };

  // Handle file upload
  uploadHandler(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.sendStatus(status.REQUEST_TOO_LONG);
      }
      return next(err);
    }

    // Find the current entry data for comparison
    dal.getOneRaw(entryId, (errr, oldEntry) => {
      if (errr) {
        return next(errr);
      }

      // Allow only creator or admin to edit.
      if (req.user.name !== oldEntry.user && req.user.admin === false) {
        return res.sendStatus(status.FORBIDDEN);
      }

      // New markdown text replaces old markdown text, even if empty.
      let newMarkdown = req.body.entrytext;
      // var oldMarkdown = oldEntry.data.markdown;

      // Do not allow empty strings
      if (typeof newMarkdown === 'string' && newMarkdown.trim().length === 0) {
        newMarkdown = null;
      }

      // New file replaces old file only if new file is not empty.
      const hasNewFile = (typeof req.file === 'object');
      const hasOldFile = (typeof oldEntry.data.filepath === 'string');
      const hasFile = (hasNewFile || hasOldFile);

      const hasNewVisit = hasFile && req.body.entryvisit === 'visited';
      // var hasOldVisit = oldEntry.data.isVisit;

      const hasText = (typeof newMarkdown === 'string');

      if (!hasFile && !hasText) {
        // Cannot make empty post.
        return res.sendStatus(status.BAD_REQUEST);
      }

      if (hasNewFile) {
        // Create thumbnail. Create even for non-images.
        uploads.createThumbnail(req.file, (errt, thumb) => {
          if (errt) {
            return next(errt);
          }

          dal.changeLocationEntry({
            oldEntry: oldEntry,
            locationName: location.name,
            markdown: hasText ? newMarkdown : null,
            isVisit: hasNewVisit,
            filepath: uploads.getRelativePath(req.file.path),
            mimetype: req.file.mimetype,
            thumbfilepath: uploads.getRelativePath(thumb.path),
            thumbmimetype: thumb.mimetype,
          }, then);
        });

        return;
      }

      // Use previous thumbnail
      dal.changeLocationEntry({
        oldEntry: oldEntry,
        locationName: location.name,
        markdown: hasText ? newMarkdown : null,
        isVisit: hasNewVisit,
        filepath: oldEntry.data.filepath,
        mimetype: oldEntry.data.mimetype,
        thumbfilepath: oldEntry.data.thumbfilepath,
        thumbmimetype: oldEntry.data.thumbmimetype,
      }, then);
    });
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
