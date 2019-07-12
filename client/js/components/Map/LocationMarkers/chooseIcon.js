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
    symbol = 'residental';
  }
  if (loc.tags.indexOf('factory') !== -1) {
    symbol = 'factory';
  }
  if (loc.tags.indexOf('mining') !== -1) {
    symbol = 'mining';
  }
  if (loc.tags.indexOf('marine') !== -1) {
    symbol = 'marine';
  }
  if (loc.tags.indexOf('railway') !== -1) {
    symbol = 'railway';
  }
  if (loc.tags.indexOf('military') !== -1) {
    symbol = 'military';
  }
  if (loc.tags.indexOf('sawmill') !== -1) {
    symbol = 'sawmill';
  }
  if (loc.tags.indexOf('tree') !== -1) {
    symbol = 'tree';
  }
  if (loc.tags.indexOf('grave') !== -1) {
    symbol = 'grave';
  }
  if (loc.tags.indexOf('campfire') !== -1) {
    symbol = 'campfire';
  }
  if (loc.tags.indexOf('leisure') !== -1) {
    symbol = 'leisure';
  }
  if (loc.tags.indexOf('sports') !== -1) {
    symbol = 'sports';
  }
  if (loc.tags.indexOf('agricultural') !== -1) {
    symbol = 'agricultural';
  }

  // Build URL

  var iconName = template + '-' + symbol + '.png';
  var iconUrl = '/api/icons/' + iconName;

  var iconObj = icons.marker(iconUrl);

  return iconObj;
};
