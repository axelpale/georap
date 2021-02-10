
var templates = require('./templates');
var dal = require('./dal');
var loggers = require('../../../services/logs/loggers');
var config = require('tresdb-config');
var status = require('http-status-codes');
var sanitizeFilename = require('sanitize-filename');
var slugify = require('slugify');
var uploads = require('../../../../services/uploads');
var entriesDal = require('../../../entries/dal');
var uploadHandler = uploads.uploader.single('entryfile');

exports.get = function (req, res, next) {
  // Fetch single attachment
  return res.json(req.attachment);
};

exports.rotatePhoto = function (req, res, next) {
  // Try to rotate photo attachment.

  var atta = req.attachment;

  // TODO var imageFile = path ?
  // TODO sharp

  // After rotate, create thumbnail.
  // Create even for non-images.
  uploads.createThumbnail(imageFile, function (errt, thumb) {
    if (errt) {
      return next(errt);
    }

    dal.changeAttachment({
      filepath: uploads.getRelativePath(req.file.path),
      mimetype: req.file.mimetype,
      thumbfilepath: uploads.getRelativePath(thumb.path),
      thumbmimetype: thumb.mimetype,
    }, function (err) {
      if (err) {
        return next(err);
      }
      return res.sendStatus(status.OK);
    });
  });
};

exports.remove = function (req, res, next) {
  // Remove an attachment
  var key = req.attachment.key;
  var username = req.user.name;

  // TODO Ensure user is owner or admin

  dal.remove({
    key: key,
  }, function (err) {
    if (err) {
      return next(err);
    }
    return res.sendStatus(status.OK);
  });
};
