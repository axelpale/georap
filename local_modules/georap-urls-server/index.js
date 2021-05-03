const config = require('georap-config')
const urljoin = require('url-join')
const staticUrl = config.staticUrl
const uploadUrl = config.uploadUrl

exports.completeAttachment = (attachment) => {
  return Object.assign({}, attachment, {
    url: urljoin(uploadUrl, attachment.filepath),
    thumbUrl: urljoin(uploadUrl, attachment.thumbfilepath)
  })
}

exports.attachmentUrl = (filepath) => {
  return urljoin(uploadUrl, filepath)
}

exports.locationTypeToSymbolUrl = (type) => {
  const baseUrl = staticUrl + '/images/markers/symbols/'
  return baseUrl + type + '.png'
}

exports.markerIconUrl = (templateName, symbolName) => {
  const iconName = templateName + '-' + symbolName + '.png'
  return '/api/icons/' + iconName
}
