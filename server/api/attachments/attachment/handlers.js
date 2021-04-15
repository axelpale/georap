
const dal = require('./dal');
const urls = require('georap-urls-server');
const status = require('http-status-codes');
const uploads = require('../../../services/uploads');

exports.get = (req, res) => {
  // Fetch single attachment.
  // Already feched but here it is a good place to strip any unnecesary data.
  const attachmentWithUrls = urls.completeAttachment(req.attachment);
  return res.json(attachmentWithUrls);
};

exports.rotateImage = (req, res, next) => {
  // Try to rotate photo attachment.
  // This will create a new attachment with the rotated image.
  //
  // Response with JSON
  //   {
  //     attachment: <attachment with full urls>
  //   }
  //
  // NOTE At first, we tried to rotate images in place, overwriting the orig.
  // That had two drawbacks:
  // - identical path does not bust caches
  // - sharp cannot output image to the source path
  // Then, we tried rename the rotated file with -rot postfix and
  // update the paths in the attachment object.
  // That had one major drawback: the attachment key remained the same
  // and therefore there was no simple way to cancel the rotation
  // whenever user cancels the entry edit. Also, rotations would not
  // be visible in location_entry_changed events if key remains the same.
  // Therefore, it is better to create a brand new attachment.
  //
  const atta = req.attachment;

  // Detect if image
  if (!atta.mimetype.startsWith('image/')) {
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

  // If 0 degree, no need to rotate. Response with the same attachment
  const circle = 360;
  if (degrees % circle === 0) {
    return res.json({
      attachment: atta,
    });
  }

  const sourcePath = uploads.getAbsolutePath(atta.filepath);

  // Prepare directory for a new permanent upload.
  uploads.preparePermanent(sourcePath, (errp, targetPath) => {
    if (errp) {
      return next(errp);
    }

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

        const creationParams = {
          username: atta.user, // TODO should be current user?
          filepath: uploads.getRelativePath(targetPath),
          mimetype: atta.mimetype,
          thumbfilepath: uploads.getRelativePath(thumb.path),
          thumbmimetype: thumb.mimetype,
        };

        // Create new attachment
        dal.create(creationParams, (errc, newAttachment) => {
          if (errc) {
            return next(errc);
          }

          return res.json({
            attachment: urls.completeAttachment(newAttachment),
          });
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
