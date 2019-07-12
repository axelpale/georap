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

module.exports = function (loc, visitedManager) {
  var template = 'default';
  var symbol = 'default';

  // Choose template

  var isVisited = visitedManager.isVisited(loc._id);
  var isDemolished = (loc.tags.indexOf('demolished') !== -1);

  if (isVisited) {
    if (isDemolished) {
      template = 'demolishedvisited';
    } else {
      template = 'visited';
    }
  } else if (isDemolished) {
    template = 'demolished';
  }

  // Choose symbol

  var typeTag = loc.tags.find(isTypeTag);
  if (typeTag) {
    symbol = typeTag;
  } else {
    symbol = 'default';
  }

  // Build URL

  var iconName = template + '-' + symbol + '.png';
  var iconUrl = '/api/icons/' + iconName;

  var iconObj = icons.marker(iconUrl);

  return iconObj;
};
