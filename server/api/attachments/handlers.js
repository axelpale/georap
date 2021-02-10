var dal = require('./dal');
var status = require('http-status-codes');

exports.count = function (req, res, next) {
  // Number of attachments
  dal.count(function (err, num) {
    if (err) {
      return next(err);
    }
    return res.json(num);
  });
};

exports.create = function (req, res, next) {
  // Create attachment.
  //
  // File is required
  //
  var username = req.user.name;

  var then = function (err) {
    if (err) {
      return next(err);
    }
    // Return json because client side response handlers expect json.
    // jQuery throws error if no json.
    return res.json({});
  };

  uploadHandler(req, res, function (err) {
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

    if (typeof req.file !== 'object') {
      // No file attachment
      return res.sendStatus(status.BAD_REQUEST);
    }

    // Has file.
    // Create a thumbnail. Create even for non-images. May be generated.
    uploads.createThumbnail(req.file, function (errt, thumb) {
      if (errt) {
        return next(errt);
      }

      dal.createAttachment({
        username: username,
        filepath: uploads.getRelativePath(req.file.path),
        mimetype: req.file.mimetype,
        thumbfilepath: uploads.getRelativePath(thumb.path),
        thumbmimetype: thumb.mimetype,
      }, then);
    });
  });
};
