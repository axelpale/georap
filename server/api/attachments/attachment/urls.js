const config = require('tresdb-config');
const urljoin = require('url-join');

exports.complete = function (attachment) {
  return Object.assign({}, attachment, {
    url: urljoin(config.uploadUrl, attachment.filepath),
    thumburl: urljoin(config.uploadUrl, attachment.thumbfilepath),
  });
};
