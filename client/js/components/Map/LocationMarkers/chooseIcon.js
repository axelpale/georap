/* eslint-disable max-statements */
var icons = require('../lib/icons');
var urls = require('tresdb-urls');

module.exports = function (loc, zoomLevel, visitedManager) {
  // Return an icon specification compatible with Google Maps Markers

  // Choose template
  var templateName = 'default';

  var isVisited = visitedManager.isVisited(loc._id);
  var isDemolished = loc.status === 'demolished'; // TODO rm inst specificity
  var isParent = loc.childLayer > zoomLevel;

  var templateSuffix = '';
  // Set suffix. Visited takes priority.
  if (isVisited) {
    templateSuffix = 'visited';
  } else if (isDemolished) {
    templateSuffix = 'demolished';
  }

  // Suffix
  if (isParent) {
    templateSuffix += 'parent';
  }

  if (templateSuffix.length > 0) {
    templateName = templateSuffix;
  } // else use templateName as is

  // Choose symbol
  var symbol = loc.type;

  // Build URL
  var iconUrl = urls.markerIconUrl(templateName, symbol);

  var iconObj = icons.marker(iconUrl);

  return iconObj;
};
