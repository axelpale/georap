// Try more functional attempt for a while.
//
var config = window.tresdb.config;
var urljoin = require('url-join');

exports.getFileName = function (attachment) {
  // Get filename part of attachment file path.
  //
  // For example if filepath === '/foo/bar/baz.jpg'
  // then getFileName() === 'baz.jpg'
  var p = attachment.filepath;
  return p.substr(p.lastIndexOf('/') + 1);
};

exports.getUrl = function (attachment) {
  return urljoin(config.uploadUrl, attachment.filepath);
};

exports.getMimeType = function (attachment) {
  // Return null if no file
  return attachment.mimetype;
};

exports.getThumbUrl = function (attachment) {
  return urljoin(config.uploadUrl, attachment.thumbfilepath);
};

exports.getThumbMimeType = function (attachment) {
  // Return null if no file
  return attachment.thumbmimetype;
};
