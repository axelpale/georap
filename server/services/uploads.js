// File upload request parser config

var local = require('../../config/local');

var sharp = require('sharp');
var multer = require('multer');
var path = require('path');
var fse = require('fs-extra');
var shortid = require('shortid');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var year = (new Date()).getFullYear().toString();
    var key = shortid.generate();
    var absDir = path.resolve(local.uploadDir, year, key);

    fse.mkdirs(absDir, function (err) {
      if (err) {
        return cb(err);
      }
      return cb(null, absDir);
    });
  },
  filename: function (req, file, cb) {
    return cb(null, file.originalname);
  },
});

exports.uploader = multer({ storage: storage });
//module.exports = multer({ dest: local.uploadDir });

exports.getRelativePath = function (absolutePath) {
  // Return path relative to upload directory
  return path.relative(local.uploadDir, absolutePath);
};

exports.createThumbnail = function (file, size, callback) {
  // Create a thumbnail for the file.
  //
  // Parameters:
  //   file
  //     Equals to req.file created by multer
  //   size
  //     max width and height of the thumbnail image in pixels
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

  // eslint-disable-next-line no-magic-numbers
  if (file.mimetype.substr(0, 6) === 'image/') {

    // Shrink with sharp.
    // For docs, see http://sharp.dimens.io/en/stable/
    sharp(file.path)
      .resize(size)
      .withoutEnlargement()
      .toFile(thumbpath, function (err) {
        if (err) {
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
