/* eslint-disable no-var */

if (!tresdb.config) {
  throw new Error(
    'No client-side configuration detected. ' +
    'Ensure the urls module is called from client-side code ' +
    'and after configuration is set.'
  )
}

var staticUrl = tresdb.config.staticUrl

exports.locationTypeToSymbolUrl = function (type) {
  var baseUrl = staticUrl + '/images/markers/symbols/'
  return baseUrl + type + '.png'
}

exports.markerIconUrl = function (templateName, symbolName) {
  var iconName = templateName + '-' + symbolName + '.png'
  return '/api/icons/' + iconName
}
