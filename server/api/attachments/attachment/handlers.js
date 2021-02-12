
var dal = require('./dal');
var status = require('http-status-codes');
var uploads = require('../../../services/uploads');

exports.get = function (req, res) {
  // Fetch single attachment.
  // Already feched but here it is a good place to strip any unnecesary data.
  return res.json(req.attachment);
};

exports.rotateImage = function (req, res, next) {
  // Try to rotate photo attachment.

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

  // Rotate
  uploads.rotateImage(atta.filepath, degrees, (err) => {
    if (err) {
      return next(err);
    }
    // After rotate, recreate thumbnail.
    uploads.createThumbnail({
      path: atta.filepath,
      mimetype: atta.mimetype,
    }, (errt) => {
      if (errt) {
        return next(errt);
      }
      return res.send('Rotated ' + degrees + 'deg');
    });
  });
};

exports.remove = function (req, res, next) {
  // Remove an attachment
  var key = req.attachment.key;

  dal.remove({
    key: key,
  }, function (err) {
    if (err) {
      return next(err);
    }
    return res.json({
      removed: 1, // TODO actual value from mongo
    });
  });
};
