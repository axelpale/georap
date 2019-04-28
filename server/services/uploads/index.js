// File upload request parser config

var local = require('../../../config/local');

var sharp = require('sharp');
var multer = require('multer');
var mime = require('mime');
var path = require('path');
var fse = require('fs-extra');
var shortid = require('shortid');
var sanitize = require('sanitize-filename');
var moment = require('moment');
var download = require('download');

var sanitizeFilename = function (fname) {
  // Convert filename to a universally compatible one.
  // Remove suspicious characters. Might end up with empty filename.
  var safeButMaybeEmpty = sanitize(fname);

  // If empty, come up with a filename.
  if (safeButMaybeEmpty.length < 1) {
    return shortid.generate();
  }

  // Convert spaces to _
  var safe = safeButMaybeEmpty.replace(/\s+/g, '_');

  return safe;
};

var sanitizedOriginal = function (req, file, cb) {
  return cb(null, sanitizeFilename(file.originalname));
};

var dateShortId = function (req, file, cb) {
  var name = moment().format('YYYY-MM-DD') + '-' + shortid.generate();
  var absDir = path.resolve(local.tempUploadDir, name);

  fse.mkdirs(absDir, function (err) {
    if (err) {
      return cb(err);
    }
    return cb(null, absDir);
  });
};

var yearShortId = function (req, file, cb) {
  // Parameters
  //   req (not needed)
  //   file (not needed)
  //   cb
  //     function (err, absoluteDirPath)
  var year = (new Date()).getFullYear().toString();
  var key = shortid.generate();
  var absDir = path.resolve(local.uploadDir, year, key);

  fse.mkdirs(absDir, function (err) {
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
    fileSize: local.uploadSizeLimit,  // bytes
  },
});

exports.tempUploader = multer({
  storage: multer.diskStorage({
    destination: dateShortId,
    filename: sanitizedOriginal,
  }),
  limits: {
    fileSize: local.tempUploadSizeLimit,  // bytes
  },
});

exports.getAbsolutePath = function (relativePath) {
  // Return absolute path for a path relative to upload dir.
  return path.resolve(local.uploadDir, relativePath);
};

exports.getRelativePath = function (absolutePath) {
  // Return path relative to upload directory
  return path.relative(local.uploadDir, absolutePath);
};

// exports.makeLocalPermanent = function (tempFilePath, callback) {
//   // Copy a file from a temporary local location to
//   // the permanent upload directory.
//   //
//   // Parameters:
//   //   tempFilePath
//   //     absolute local file path to source file
//   //   callback
//   //     function (err, newFilePath)
//   //
//   var fname = path.basename(tempFilePath);
//
//   yearShortId(null, null, function (err, absDirPath) {
//     if (err) {
//       return callback(err);
//     }
//
//     var sanename = sanitizeFilename(fname);
//     var newpath = path.resolve(absDirPath, sanename);
//
//     fse.copy(tempFilePath, newpath, function (errm) {
//       if (errm) {
//         return callback(errm);
//       }
//
//       return callback(null, newpath);
//     });
//   });
// };

exports.makePermanent = function (filePath, callback) {
  // Copy a file to the permanent upload directory.
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

  var fname = path.basename(filePath);

  yearShortId(null, null, function (err, absDirPath) {
    if (err) {
      return callback(err);
    }

    var sanename = sanitizeFilename(fname);
    var newpath = path.resolve(absDirPath, sanename);

    if (filePath.startsWith('http')) {
      console.log('downloading', filePath);
      console.log('saving into', newpath);
      download(filePath, absDirPath, {
        timeout: 5000, // ms
      }).then(function () {
        return callback(null, newpath);
      }).catch(function (errd) {
        return callback(errd);
      });
    } else {
      fse.copy(filePath, newpath, function (errm) {
        if (errm) {
          return callback(errm);
        }

        return callback(null, newpath);
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
  //   filename
  //   path

  // Let file.path = '/haha/foo.bar'
  var ext = path.extname(file.path);  // ext = '.bar'
  var dir = path.dirname(file.path);  // dir = '/haha'
  var base = path.basename(file.path, ext);  // base = 'foo'

  var fix = '_medium';
  var thumbname = base + fix + '.jpg';
  var thumbpath = path.join(dir, thumbname);

  // Often the mimetype can be deducted from extension
  var mimetype;
  if (typeof file.mimetype === 'string') {
    mimetype = file.mimetype;
  } else {
    mimetype = mime.getType(ext.substr(1));
  }

  // max width and height of the thumbnail image in pixels
  var size = local.uploadThumbSize;

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
      .toFile(thumbpath, function (err) {
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
