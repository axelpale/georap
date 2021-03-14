
const dal = require('./dal');
const lib = require('./lib');
const urls = require('./urls');
const status = require('http-status-codes');
const uploads = require('../../../services/uploads');

exports.get = (req, res) => {
  // Fetch single attachment.
  // Already feched but here it is a good place to strip any unnecesary data.
  const attachmentWithUrls = urls.complete(req.attachment);
  return res.json(attachmentWithUrls);
};

exports.rotateImage = (req, res, next) => {
  // Try to rotate photo attachment.
  //
  // Response with JSON
  //   {
  //     attachment: <attachment with full urls>
  //   }
  //
  const atta = req.attachment;

  // Detect if image
  // eslint-disable-next-line no-magic-numbers
  if (atta.mimetype.substr(0, 6) !== 'image/') {
    // No file attachment
    const msg = 'Cannot rotate ' + atta.mimetype;
    return res.status(status.BAD_REQUEST).send(msg);
  }

  // Positive for clockwise rotation.
  const degrees = parseInt(req.body.degrees, 10);
  if (isNaN(degrees)) {
    const msg = 'Invalid degree ' + degrees;
    return res.status(status.BAD_REQUEST).send(msg);
  }

  // If 0 degree, no need to rotate.
  // eslint-disable-next-line no-magic-numbers
  if (degrees % 360 === 0) {
    return res.send('Skipped unnecessary rotation of 0deg');
  }

  const sourcePath = uploads.getAbsolutePath(atta.filepath);

  // To bust caches, the new name is an easy way.
  const targetPath = lib.appendToFilename(sourcePath, '-rot');

  // Rotate
  uploads.rotateImage(sourcePath, targetPath, degrees, (err) => {
    if (err) {
      return next(err);
    }
    // After rotate, recreate thumbnail.
    uploads.createThumbnail({
      path: targetPath,
      mimetype: atta.mimetype,
    }, (errt, thumb) => {
      if (errt) {
        return next(errt);
      }

      const updateParams = {
        key: atta.key,
        filepath: uploads.getRelativePath(targetPath),
        mimetype: atta.mimetype,
        thumbfilepath: uploads.getRelativePath(thumb.path),
        thumbmimetype: thumb.mimetype,
      };

      // Update attachment
      dal.change(updateParams, (errc) => {
        if (errc) {
          return next(errc);
        }

        const updatedAttachment = Object.assign({}, atta, updateParams);
        const attachmentWithUrls = urls.complete(updatedAttachment);

        return res.json({
          attachment: attachmentWithUrls,
        });
      });
    });
  });
};

exports.remove = (req, res, next) => {
  // Remove an attachment
  const key = req.attachment.key;

  dal.remove({
    key: key,
  }, (err) => {
    if (err) {
      return next(err);
    }
    return res.json({
      removed: 1, // TODO actual value from mongo
    });
  });
};
