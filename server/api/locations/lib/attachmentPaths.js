
var local = require('../../../../config/local');
var path = require('path');
var urljoin = require('url-join');

exports.getRelativeFilePath = function (fileEntry) {
  return fileEntry.data.filepath;
};

exports.getRelativeUrl = function (fileEntry) {
  // FIXME: this would yield invalid url on windows servers.
  return fileEntry.data.filepath;
};

exports.getAbsoluteFilePath = function (fileEntry) {
  var relPath = exports.getRelativeFilePath(fileEntry);

  return path.resolve(local.uploadDir, relPath);
};

exports.getAbsoluteUrl = function (fileEntry) {
  var relUrl = exports.getRelativeUrl(fileEntry);

  return urljoin(local.uploadUrl, relUrl);
};
