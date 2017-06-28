

var uploads = require('../../../../services/uploads');
var dal = require('../../../entries/dal');
var uploadHandler = uploads.uploader.single('entryfile');

var status = require('http-status-codes');


exports.change = function (req, res) {
  // Update entry.
  //
  // File is optional.

  var entryId = req.entryId;

  // Editor vs creator. TODO make a difference between
  // var username = req.user.name;

  var then = function (err) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }
    return res.sendStatus(status.OK);
  };

  // Handle file upload
  uploadHandler(req, res, function (err) {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.sendStatus(status.REQUEST_TOO_LONG);
      }
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    // Find the current entry data for comparison
    dal.getOneRaw(entryId, function (errr, oldEntry) {
      if (errr) {
        console.error(errr);
        return res.sendStatus(status.INTERNAL_SERVER_ERROR);
      }

      // Allow only creator or admin to edit.
      if (req.user.name !== oldEntry.user && req.user.admin === false) {
        return res.sendStatus(status.FORBIDDEN);
      }

      // New markdown text replaces old markdown text, even if empty.
      var newMarkdown = req.body.entrytext;
      // var oldMarkdown = oldEntry.data.markdown;

      // Do not allow empty strings
      if (typeof newMarkdown === 'string' && newMarkdown.trim().length === 0) {
        newMarkdown = null;
      }

      // New file replaces old file only if new file is not empty.
      var hasNewFile = (typeof req.file === 'object');
      var hasOldFile = (typeof oldEntry.data.filepath === 'string');
      var hasFile = (hasNewFile || hasOldFile);

      var hasNewVisit = hasFile && req.body.entryvisit === 'visited';
      // var hasOldVisit = oldEntry.data.isVisit;

      var hasText = (typeof newMarkdown === 'string');

      if (!hasFile && !hasText) {
        // Cannot make empty post.
        return res.sendStatus(status.BAD_REQUEST);
      }

      if (hasNewFile) {
        // Create thumbnail. Create even for non-images.
        uploads.createThumbnail(req.file, function (errt, thumb) {
          if (errt) {
            console.error(errt);
            return res.sendStatus(status.INTERNAL_SERVER_ERROR);
          }

          dal.changeLocationEntry({
            oldEntry: oldEntry,
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


exports.create = function (req, res) {
  // Create entry.
  //
  // File is optional

  var locationId = req.location._id;
  var locationName = req.location.name;
  var username = req.user.name;

  var then = function (err) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }
    return res.sendStatus(status.OK);
  };

  uploadHandler(req, res, function (err) {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.sendStatus(status.REQUEST_TOO_LONG);
      }
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }

    // console.log('req.file:');
    // console.log(req.file);
    // console.log('req.body:');
    // console.log(req.body);

    var markdown = req.body.entrytext;

    // Do not allow empty strings
    if (typeof markdown === 'string' && markdown.trim().length === 0) {
      markdown = null;
    }

    var hasFile = (typeof req.file === 'object');
    var hasText = (typeof markdown === 'string');
    // Visit is only regarded with a file for proof
    var hasVisit = (hasFile && req.body.entryvisit === 'visited');

    if (!hasFile && !hasText) {
      // Empty post
      return res.sendStatus(status.BAD_REQUEST);
    }

    if (hasFile) {
      // Create thumbnail. Create even for non-images.
      uploads.createThumbnail(req.file, function (errt, thumb) {
        if (errt) {
          console.error(errt);
          return res.sendStatus(status.INTERNAL_SERVER_ERROR);
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


exports.remove = function (req, res) {
  // Remove entry from db

  var locationId = req.location._id;
  var locationName = req.location.name;
  var entryId = req.entryId;
  var username = req.user.name;

  dal.removeLocationEntry({
    locationId: locationId,
    locationName: locationName,
    entryId: entryId,
    username: username,
  }, function (err) {
    if (err) {
      console.error(err);
      return res.sendStatus(status.INTERNAL_SERVER_ERROR);
    }
    return res.sendStatus(status.OK);
  });
};
