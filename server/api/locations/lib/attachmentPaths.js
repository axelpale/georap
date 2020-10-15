
var config = require('tresdb-config');
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

  return path.resolve(config.uploadDir, relPath);
};

exports.getAbsoluteUrl = function (fileEntry) {
  var relUrl = exports.getRelativeUrl(fileEntry);

  return urljoin(config.uploadUrl, relUrl);
};
