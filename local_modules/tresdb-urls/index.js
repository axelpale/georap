/* eslint-disable no-var */
var config = window.tresdb.config
var urljoin = require('url-join')

exports.attachmentUrl = function (attachment) {
  return urljoin(config.uploadUrl, attachment.filepath)
}

exports.attachmentThumbUrl = function (attachment) {
  return urljoin(config.uploadUrl, attachment.thumbfilepath)
}

exports.locationTypeToSymbolUrl = function (type) {
  var baseUrl = '/assets/images/markers/symbols/'
  return baseUrl + type + '.png'
}

exports.markerIconUrl = function (templateName, symbolName) {
  var iconName = templateName + '-' + symbolName + '.png'
  return '/api/icons/' + iconName
}
