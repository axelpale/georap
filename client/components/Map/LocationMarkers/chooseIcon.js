/* eslint-disable max-statements */
var icons = require('../lib/icons');
var urls = require('georap-urls-client');
var templates = tresdb.config.markerTemplates;

// Map size to a marker specification generating function.
var sizeToMarkerSpecs = {
  'sm': icons.small,
  'md': icons.marker,
  'lg': icons.large,
};

var getChildStatus = function (size, childLayer, zoomLevel) {
  if (size === 'sm') {
    return 'none';
  } // else
  if (childLayer > zoomLevel) {
    return 'unknown';
  }
  return 'none';
};

module.exports = function (mloc, zoomLevel, isSelected, flags) {
  // Return an icon specification compatible with Google Maps Markers.
  //
  // Params:
  //   mloc
  //     A marker location object
  //   zoomLevel
  //     Integer. Required to determine if marker has children.
  //   isSelected
  //     boolean. Selected markers are larger.
  //   flags
  //     Array of flag strings. They often determine template color.
  //

  // Template parts
  var status = mloc.status;
  var flag = flags.length > 0 ? flags[0] : 'default';
  var size = isSelected ? 'lg' : 'md';
  var symbol = size === 'sm' ? 'any' : mloc.type;

  var childStatus = getChildStatus(size, mloc.childLayer, zoomLevel);

  // Combine
  var templateName = templates[status][flag][size] + '-' + childStatus;

  // Build URL
  var iconUrl = urls.markerIconUrl(templateName, symbol);
  // Build maps icon specs
  var iconObj = sizeToMarkerSpecs[size](iconUrl);
  // Return the icon specs
  return iconObj;
};
