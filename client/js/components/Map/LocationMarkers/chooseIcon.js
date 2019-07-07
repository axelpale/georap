/* eslint-disable no-lonely-if */
var icons = require('../lib/icons');

module.exports = function (loc, visitedManager) {
  var icon;

  var isVisited = visitedManager.isVisited(loc._id);
  var isDemolished = (loc.tags.indexOf('demolished') !== -1);

  // Choose icon according to the visits
  if (isVisited) {
    // Found from visits
    if (isDemolished) {
      icon = icons.markerDemolishedVisited();
    } else {
      icon = icons.markerVisited();
    }
  } else {
    // Not found from visits
    if (isDemolished) {
      icon = icons.markerDemolished();
    } else {
      icon = icons.marker();
    }
  }

  return icon;
};
