const config = require('tresdb-config');
const urljoin = require('url-join');

exports.complete = (attachment) => {
  return Object.assign({}, attachment, {
    url: urljoin(config.uploadUrl, attachment.filepath),
    thumburl: urljoin(config.uploadUrl, attachment.thumbfilepath),
  });
};

exports.completeToUrl = (filepath) => {
  return urljoin(config.uploadUrl, filepath);
};

exports.completeEach = (attachments) => {
  return attachments.map(exports.complete);
};
