exports.locationTypeToSymbolUrl = function (type) {
  var baseUrl = '/assets/images/markers/symbols/';
  return baseUrl + type + '.png';
};

exports.iconUrl = function (templateName, symbolName) {
  var iconName = templateName + '-' + symbolName + '.png';
  return '/api/icons/' + iconName;
};