const config = require('georap-config')
const urljoin = require('url-join')
const staticUrl = config.staticUrl
const uploadUrl = config.uploadUrl

exports.baseUrl = require('./baseUrl')

exports.completeAttachment = (attachment) => {
  // Add url properties.
  const thumburl = urljoin(uploadUrl, attachment.thumbfilepath)
  return Object.assign({}, attachment, {
    url: urljoin(uploadUrl, attachment.filepath),
    thumbUrl: thumburl, // note camelCase, legacy
    thumburl: thumburl
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
