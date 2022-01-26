if (!georap.config) {
  throw new Error(
    'No client-side configuration detected. ' +
    'Ensure the urls module is called from client-side code ' +
    'and after configuration is set.'
  )
}

var staticUrl = georap.config.staticUrl

exports.baseUrl = require('./baseUrl')

exports.locationUrl = function (locId) {
  // Local absolute URL path to location.
  return '/locations/' + locId
}

exports.locationTypeToSymbolUrl = function (type) {
  var baseUrl = staticUrl + '/images/markers/symbols/'
  return baseUrl + type + '.png'
}

exports.markerIconUrl = function (templateName, symbolName) {
  var iconName = templateName + '-' + symbolName + '.png'
  return '/api/icons/' + iconName
}
