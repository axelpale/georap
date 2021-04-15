const config = require('tresdb-config');
const staticUrl = config.staticUrl;

exports.locationTypeToSymbolUrl = (type) => {
  const baseUrl = staticUrl + '/images/markers/symbols/'
  return baseUrl + type + '.png'
}

exports.markerIconUrl = (templateName, symbolName) => {
  const iconName = templateName + '-' + symbolName + '.png'
  return '/api/icons/' + iconName
}
