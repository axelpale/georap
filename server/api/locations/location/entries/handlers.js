
const uploads = require('../../../../services/uploads');
const dal = require('../../../entries/dal');
const status = require('http-status-codes');

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
  // File is optional

  const locationId = req.location._id;
  const locationName = req.location.name;
  const username = req.user.name;

  const then = (err) => {
    if (err) {
      return next(err);
    }
    // Return json because client side response handlers expect json.
    // jQuery throws error if no json.
    return res.json({});
  };

  uploadHandler(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.sendStatus(status.REQUEST_TOO_LONG);
      }
      return next(err);
    }

    // console.log('req.file:');
    // console.log(req.file);
    // console.log('req.body:');
    // console.log(req.body);

    let markdown = req.body.entrytext;

    // Do not allow empty strings
    if (typeof markdown === 'string' && markdown.trim().length === 0) {
      markdown = null;
    }

    const hasFile = (typeof req.file === 'object');
    const hasText = (typeof markdown === 'string');
    // Visit is only regarded with a file for proof
    const hasVisit = (hasFile && req.body.entryvisit === 'visited');

    if (!hasFile && !hasText) {
      // Empty post
      return res.sendStatus(status.BAD_REQUEST);
    }

    if (hasFile) {
      // Create thumbnail. Create even for non-images.
      uploads.createThumbnail(req.file, (errt, thumb) => {
        if (errt) {
          return next(errt);
        }

        dal.createLocationEntry({
          locationId: locationId,
          locationName: locationName,
          username: username,
          markdown: hasText ? markdown : null,
          isVisit: hasVisit,
          filepath: uploads.getRelativePath(req.file.path),
          mimetype: req.file.mimetype,
          thumbfilepath: uploads.getRelativePath(thumb.path),
          thumbmimetype: thumb.mimetype,
        }, then);
      });

      return;
    }

    // No thumbnail
    dal.createLocationEntry({
      locationId: locationId,
      locationName: locationName,
      username: username,
      markdown: hasText ? markdown : null,
      isVisit: hasVisit,
      filepath: null,
      mimetype: null,
      thumbfilepath: null,
      thumbmimetype: null,
    }, then);

  });
};


exports.remove = (req, res, next) => {
  // Remove entry from db

  const locationId = req.location._id;
  const locationName = req.location.name;
  const entryId = req.entryId;
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
