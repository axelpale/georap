/* global google */
/* eslint-disable no-magic-numbers */

// Map marker icon definitions. The icons can be used only after google maps
// api has been loaded. Therefore, call the methods after initMap.

var SIZE = 32;

exports.marker = function () {
  return {
    labelOrigin: new google.maps.Point(11, 46),
    url: '/assets/images/mapicons/marker.png',
    size: new google.maps.Size(22, 40),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(11, 40),
  };
};

exports.markerVisited = function () {
  return {
    labelOrigin: new google.maps.Point(11, 46),
    url: '/assets/images/mapicons/markerVisited.png',
    size: new google.maps.Size(22, 40),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(11, 40),
  };
};

exports.geolocation = function () {
  return {
    url: '/assets/images/mapicons/geolocation.png',
    size: new google.maps.Size(SIZE, SIZE),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(SIZE / 2, SIZE / 2),
  };
};

exports.additionMarker = function () {
  return {
    url: '/assets/images/mapicons/additionMarker.png',
    size: new google.maps.Size(60, 107),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(30, 107),
  };
};
