
const config = require('tresdb-config');
const path = require('path');
const urljoin = require('url-join');

exports.getRelativeFilePath = function (fileEntry) {
  return fileEntry.data.filepath;
};

exports.getRelativeUrl = function (fileEntry) {
  // FIXME: this would yield invalid url on windows servers.
  return fileEntry.data.filepath;
};

exports.getAbsoluteFilePath = function (fileEntry) {
  const relPath = exports.getRelativeFilePath(fileEntry);

  return path.resolve(config.uploadDir, relPath);
};

exports.getAbsoluteUrl = function (fileEntry) {
  const relUrl = exports.getRelativeUrl(fileEntry);

  return urljoin(config.uploadUrl, relUrl);
};
