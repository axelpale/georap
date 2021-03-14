const config = require('tresdb-config');
const urljoin = require('url-join');

exports.complete = function (attachment) {
  return Object.assign({}, attachment, {
    url: urljoin(config.uploadUrl, attachment.filepath),
    thumburl: urljoin(config.uploadUrl, attachment.thumbfilepath),
  });
};

exports.completeEach = function (attachments) {
  return attachments.map(exports.complete);
};
