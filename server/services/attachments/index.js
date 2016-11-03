
var local = require('../../../config/local');
var path = require('path');
var urljoin = require('url-join');

exports.getRelativeFilePath = function (fileEntry) {
  var time = new Date(fileEntry.time);
  var key = fileEntry.data.key;
  var year = time.getFullYear().toString();

  return path.join(year, key, fileEntry.data.filename);
};

exports.getRelativeUrl = function (fileEntry) {
  var time = new Date(fileEntry.time);
  var key = fileEntry.data.key;
  var year = time.getFullYear().toString();

  return urljoin(year, key, fileEntry.data.filename);
};

exports.getAbsoluteFilePath = function (fileEntry) {
  var relPath = exports.getRelativeFilePath(fileEntry);

  return path.resolve(local.uploadDir, relPath);
};

exports.getAbsoluteUrl = function (fileEntry) {
  var relUrl = exports.getRelativeUrl(fileEntry);

  return urljoin(local.uploadUrl, relUrl);
};
