// File upload request parser config

var local = require('../../../../config/local');
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
