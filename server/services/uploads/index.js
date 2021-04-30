// File upload request parser

const config = require('georap-config');
const sharp = require('sharp');
const multer = require('multer');
const mime = require('mime');
const path = require('path');
const fse = require('fs-extra');
const shortid = require('shortid');
const sanitize = require('sanitize-filename');
const moment = require('moment');
const download = require('download');

const sanitizeFilename = function (fname) {
  // Convert filename to a universally compatible one.
  // Remove suspicious characters. Might end up with empty filename.
  const safeButMaybeEmpty = sanitize(fname);

  // If empty, come up with a filename.
  if (safeButMaybeEmpty.length < 1) {
    return shortid.generate();
  }

  // Convert spaces to _
  const safe = safeButMaybeEmpty.replace(/\s+/g, '_');

  return safe;
};

const sanitizedOriginal = function (req, file, cb) {
  return cb(null, sanitizeFilename(file.originalname));
};

const dateShortId = function (req, file, cb) {
  const name = moment().format('YYYY-MM-DD') + '-' + shortid.generate();
  const absDir = path.resolve(config.tempUploadDir, name);

  fse.mkdirs(absDir, (err) => {
    if (err) {
      return cb(err);
    }
    return cb(null, absDir);
  });
};

const yearShortId = function (req, file, cb) {
  // Parameters
  //   req (not needed)
  //   file (not needed)
  //   cb
  //     function (err, absoluteDirPath)
  const year = (new Date()).getFullYear().toString();
  const key = shortid.generate();
  const absDir = path.resolve(config.uploadDir, year, key);

  fse.mkdirs(absDir, (err) => {
    if (err) {
      return cb(err);
    }
    return cb(null, absDir);
  });
};

exports.uploader = multer({
  storage: multer.diskStorage({
    destination: yearShortId,
    filename: sanitizedOriginal,
  }),
  limits: {
    fileSize: config.uploadSizeLimit,  // bytes
  },
});

exports.tempUploader = multer({
  storage: multer.diskStorage({
    destination: dateShortId,
    filename: sanitizedOriginal,
  }),
  limits: {
    fileSize: config.tempUploadSizeLimit,  // bytes
  },
});

exports.getAbsolutePath = function (relativePath) {
  // Return absolute path for a path relative to upload dir.
  return path.resolve(config.uploadDir, relativePath);
};

exports.getRelativePath = function (absolutePath) {
  // Return path relative to upload directory
  return path.relative(config.uploadDir, absolutePath);
};

exports.preparePermanent = function (filePath, callback) {
  // Generate a new permanent path and
  // prepare an upload directory for the given file.
  // Do not copy the file or alter it any way.
  //
  // Parameters:
  //   filePath
  //     absolute file path or URL to source file
  //   callback
  //     function (err, newFilePath)
  //
  if (typeof filePath !== 'string') {
    throw new Error('invalid filePath:' + filePath);
  }

  const fname = path.basename(filePath);

  yearShortId(null, null, (err, absDirPath) => {
    if (err) {
      return callback(err);
    }

    const sanename = sanitizeFilename(fname);
    const newpath = path.resolve(absDirPath, sanename);

    return callback(null, newpath);
  });
};

exports.makePermanent = function (filePath, callback) {
  // Copy a file to the permanent upload directory.
  //
  // Parameters:
  //   filePath
  //     absolute file path or URL to source file
  //   callback
  //     function (err, newFilePath)
  //
  exports.preparePermanent(filePath, (err, newPath) => {
    if (err) {
      return callback(err);
    }

    const dirPath = path.dirname(newPath);

    if (filePath.startsWith('http')) {
      console.log('downloading', filePath);
      console.log('saving into', newPath);
      download(filePath, dirPath, {
        timeout: 5000, // ms
      }).then(() => {
        return callback(null, newPath);
      }).catch((errd) => {
        return callback(errd);
      });
    } else {
      fse.copy(filePath, newPath, (errm) => {
        if (errm) {
          return callback(errm);
        }

        return callback(null, newPath);
      });
    }
  });
};

exports.createThumbnail = function (file, callback) {
  // Create a thumbnail for the file.
  //
  // Parameters:
  //   file
  //     Equals to req.file created by multer. Following props are needed:
  //       path
  //         absolute file path
  //       mimetype
  //         optional string
  //   callback
  //     function (err, thumb)
  //
  // Where thumb is object with properties:
  //   mimetype
  //   destination
  //     absolute dir path to thumbnail dir
  //   filename
  //     filename with extension
  //   path
  //     absolute path to thumbnail

  // Let file.path = '/haha/foo.bar'
  const ext = path.extname(file.path);  // ext = '.bar'
  const dir = path.dirname(file.path);  // dir = '/haha'
  const base = path.basename(file.path, ext);  // base = 'foo'

  const fix = '_medium';
  const thumbname = base + fix + '.jpg';
  const thumbpath = path.join(dir, thumbname);

  // Often the mimetype can be deducted from extension
  let mimetype;
  if (typeof file.mimetype === 'string') {
    mimetype = file.mimetype;
  } else {
    mimetype = mime.getType(ext.substr(1));
  }

  // max width and height of the thumbnail image in pixels
  const size = config.uploadThumbSize;

  // eslint-disable-next-line no-magic-numbers
  if (mimetype.substr(0, 6) === 'image/') {

    // Shrink with sharp.
    // For docs, see https://github.com/lovell/sharp
    // Note, failOnError is set to false for Samsung
    //   JPEGs to work correctly.
    //   See https://github.com/lovell/sharp/issues/1578
    sharp(file.path, { failOnError: false })
      .rotate() // No parameters indicate to use EXIF data
      .resize(size, null, { withoutEnlargement: true })
      .toFile(thumbpath, (err) => {
        if (err) {
          console.log(file);
          return callback(err);
        }

        return callback(null, {
          mimetype: 'image/jpeg',
          destination: dir,
          filename: thumbname,
          path: thumbpath,
        });
      });
  } else {
    // Thumbnail equals the original
    return callback(null, file);
  }
};

exports.rotateImage = function (imagePath, targetPath, degrees, callback) {
  // Try to rotate image and save it with new name.
  //
  // Parameters
  //   imagePath
  //     an absolute file path to the source image file.
  //   targetPath
  //     an absolute file path for the rotated image.
  //   degrees
  //     amount of rotation. Rounded to 90 deg steps.
  //   callback
  //     function (err, info)
  //       info
  //         object returned from toFile method
  //         { format, size, width, height, ... }
  //
  const QUAD = 90;
  const roundedDegrees = QUAD * Math.round(degrees / QUAD);

  if (roundedDegrees === 0) {
    // Rotated equals the original
    return callback(null);
  }

  sharp(imagePath)
    .rotate(roundedDegrees)
    .toFile(targetPath, (err, info) => {
      if (err) {
        return callback(err);
      }

      return callback(null, info);
    });
};
