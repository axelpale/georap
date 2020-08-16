/* eslint-disable max-statements */
var icons = require('../lib/icons');

var allStatusTags = [
  'walk-in',
  'active',
  'buried',
  'demolished',
  'guarded',
  'locked',
];

var isTypeTag = function (t) {
  return allStatusTags.indexOf(t) === -1;
};

module.exports = function (loc, zoomLevel, visitedManager) {
  var templateName = 'default';
  var symbol = 'default';

  // Choose template

  var isVisited = visitedManager.isVisited(loc._id);
  var isDemolished = (loc.tags.indexOf('demolished') !== -1);
  var isParent = loc.childLayer > zoomLevel;

  var templateSuffix = '';
  if (isDemolished) {
    templateSuffix += 'demolished';
  }
  if (isVisited) {
    templateSuffix += 'visited';
  }
  if (isParent) {
    templateSuffix += 'parent';
  }

  if (templateSuffix.length > 0) {
    templateName = templateSuffix;
  }

  // Choose symbol

  var typeTag = loc.tags.find(isTypeTag);
  if (typeTag) {
    symbol = typeTag;
  } else {
    symbol = 'default';
  }

  // Build URL

  var iconName = templateName + '-' + symbol + '.png';
  var iconUrl = '/api/icons/' + iconName;

  var iconObj = icons.marker(iconUrl);

  return iconObj;
};
