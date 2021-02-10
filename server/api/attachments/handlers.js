const dal = require('./dal');
const asyn = require('async');
const status = require('http-status-codes');
const uploads = require('../../services/uploads');

// Setup
const MAX_FILES = 10;
const multiUploadHandler = uploads.uploader.array('files', MAX_FILES);

exports.count = (req, res, next) => {
  // Number of attachments
  dal.count((err, num) => {
    if (err) {
      return next(err);
    }
    return res.json(num);
  });
};

exports.create = (req, res, next) => {
  // Create attachments.
  //
  // At least one file is required.
  //
  const username = req.user.name;

  multiUploadHandler(req, res, (err) => {
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

    if (typeof req.files !== 'object' || req.files.length === 0) {
      // No file attachments
      return res.sendStatus(status.BAD_REQUEST);
    }

    // Create attachment and thumbnail for each file.

    asyn.mapSeries(req.files, (file, finish) => {
      // Has file.
      // Create a thumbnail. Create even for non-images. May be generated.
      uploads.createThumbnail(file, (errt, thumb) => {
        if (errt) {
          return finish(errt);
        }

        dal.createAttachment({
          username: username,
          filepath: uploads.getRelativePath(file.path),
          mimetype: file.mimetype,
          thumbfilepath: uploads.getRelativePath(thumb.path),
          thumbmimetype: thumb.mimetype,
        }, (errc, attachment) => {
          if (errc) {
            return finish(errc);
          }
          // Return json because client side response handlers expect json.
          // jQuery throws error if no json.
          return finish(null, attachment);
        });
      });
    }, (errf, attachments) => {
      if (errf) {
        return next(errf);
      }
      return res.json({
        attachments: attachments,
      });
    });
  });
};
