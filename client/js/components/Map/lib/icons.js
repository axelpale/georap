/* global google */
/* eslint-disable no-magic-numbers */

// Map marker icon definitions. The icons can be used only after google maps
// api has been loaded. Therefore, call the methods after initMap.

var markerUrl = require('./mapicons/marker.png');
var demolishedUrl = require('./mapicons/markerDemolished.png');
var visitedUrl = require('./mapicons/markerVisited.png');
var demolishedVisitedUrl = require('./mapicons/markerDemolishedVisited.png');
var geolocationUrl = require('./mapicons/geolocation.png');
var additionMarkerUrl = require('./mapicons/additionMarker.png');

var SIZE = 32;

exports.marker = function () {
  return {
    labelOrigin: new google.maps.Point(11, 46),
    url: markerUrl,
    size: new google.maps.Size(22, 40),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(11, 40),
  };
};

exports.markerDemolished = function () {
  return {
    labelOrigin: new google.maps.Point(11, 46),
    url: demolishedUrl,
    size: new google.maps.Size(22, 40),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(11, 40),
  };
};

exports.markerVisited = function () {
  return {
    labelOrigin: new google.maps.Point(11, 46),
    url: visitedUrl,
    size: new google.maps.Size(22, 40),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(11, 40),
  };
};

exports.markerDemolishedVisited = function () {
  return {
    labelOrigin: new google.maps.Point(11, 46),
    url: demolishedVisitedUrl,
    size: new google.maps.Size(22, 40),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(11, 40),
  };
};

exports.geolocation = function () {
  return {
    url: geolocationUrl,
    size: new google.maps.Size(SIZE, SIZE),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(SIZE / 2, SIZE / 2),
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
