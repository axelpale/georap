const asyn = require('async');
const status = require('http-status-codes');
const urls = require('georap-urls-server');
const georapkey = require('georap-key');
const dal = require('./dal');
const attachmentDal = require('./attachment/dal');
const uploads = require('../../services/uploads');

// Setup
const MAX_FILES = 10;
const multiUploadHandler = uploads.uploader.array('attachments', MAX_FILES);

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
  // Request with req.user and req.files
  //
  // Response with JSON
  //   {
  //     attachments: [<attachment with urls>]
  //   }
  //
  const username = req.user.name;

  multiUploadHandler(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.sendStatus(status.REQUEST_TOO_LONG);
      }
      return next(err);
    }

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

        attachmentDal.create({
          username: username,
          filepath: uploads.getRelativePath(file.path),
          mimetype: file.mimetype,
          filesize: file.size, // bytes
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

      const attachmentsWithUrls = attachments.map(urls.completeAttachment);

      return res.json({
        attachments: attachmentsWithUrls,
      });
    });
  });
};

exports.getAll = (req, res, next) => {
  dal.getAll((err, attachments) => {
    if (err) {
      return next(err);
    }

    const attachmentsWithUrls = attachments.map(urls.completeAttachment);

    return res.json({
      attachments: attachmentsWithUrls,
    });
  });
};

exports.getMany = (req, res, next) => {
  // Find multiple attachments
  // Response with { attachments: [...] }
  //
  const keys = req.body.keys;

  // Validate keys
  try {
    if (!keys.every(georapkey.validate)) {
      return res.status(status.BAD_REQUEST).send('Invalid attribute: keys');
    }
  } catch (err) {
    return res.status(status.BAD_REQUEST).send('Invalid attribute: keys');
  }

  dal.getMany(keys, (err, attachments) => {
    if (err) {
      return next(err);
    }

    const attachmentsWithUrls = attachments.map(urls.completeAttachment);

    return res.json({
      attachments: attachmentsWithUrls,
    });
  });
};
