/* eslint-disable max-statements */
var icons = require('../lib/icons');

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

  if (loc.tags.indexOf('residental') !== -1) {
    symbol = 'house';
  }
  if (loc.tags.indexOf('mining') !== -1) {
    symbol = 'mining';
  }
  if (loc.tags.indexOf('factory') !== -1) {
    symbol = 'factory';
  }

  // Build URL

  var iconName = template + '-' + symbol + '.png';
  var iconUrl = '/api/icons/' + iconName;

  var iconObj = icons.marker(iconUrl);

  return iconObj;
};
