/* global google */
/* eslint-disable no-magic-numbers */

// Map marker icon definitions. The icons can be used only after google maps
// api has been loaded. Therefore, call the methods after initMap.

var staticUrl = tresdb.config.staticUrl;
var geolocationUrl = staticUrl + '/images/mapicons/geolocation.png';
var additionMarkerUrl = staticUrl + '/images/mapicons/additionMarker.png';

// NOTE google.maps is populated asynchronously and therefore
// we cannot shorten Point and Size references.

exports.marker = function (url) {
  return {
    labelOrigin: new google.maps.Point(11, 46),
    url: url,
    size: new google.maps.Size(22, 40),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(11, 40),
  };
};

exports.small = function (url) {
  return {
    labelOrigin: new google.maps.Point(4, 20),
    url: url,
    size: new google.maps.Size(9, 14),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(4, 14),
  };
};

exports.geolocation = function () {
  return {
    url: geolocationUrl,
    size: new google.maps.Size(32, 32),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(16, 16),
  };
};

exports.additionMarker = function () {
  return {
    url: additionMarkerUrl,
    size: new google.maps.Size(38, 66),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(19, 65),
  };
};
