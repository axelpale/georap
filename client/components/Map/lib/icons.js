/* global google */

// Map marker icon definitions. The icons can be used only after google maps
// api has been loaded. Therefore, call the methods after initMap.

var sizes = georap.config.markerTemplateSizes;
var staticUrl = georap.config.staticUrl;
var geolocationUrl = staticUrl + '/images/mapicons/geolocation.png';
var crosshairUrl = staticUrl + '/images/mapicons/crosshair.png';
var additionMarkerUrl = staticUrl + '/images/mapicons/additionMarker.png';
var labelOffset = 6;

// Default size config for pre-v15 compatibility.
if (!sizes) {
  sizes = {
    sm: {
      width: 9,
      height: 14,
    },
    md: {
      width: 22,
      height: 40,
    },
    lg: {
      width: 38,
      height: 66,
    },
  };
}

// NOTE google.maps is populated asynchronously and therefore
// we cannot shorten Point and Size references.

exports.marker = function (url) {
  var w = sizes.md.width;
  var h = sizes.md.height;
  var wmid = Math.floor(w / 2);
  return {
    labelOrigin: new google.maps.Point(wmid, h + labelOffset),
    url: url,
    size: new google.maps.Size(w, h),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(wmid, h),
  };
};

exports.small = function (url) {
  var w = sizes.sm.width;
  var h = sizes.sm.height;
  var wmid = Math.floor(w / 2);
  return {
    labelOrigin: new google.maps.Point(wmid, h + labelOffset),
    url: url,
    size: new google.maps.Size(w, h),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(wmid, h),
  };
};

exports.large = function (url) {
  var w = sizes.lg.width;
  var h = sizes.lg.height;
  var wmid = Math.floor(w / 2);
  return {
    labelOrigin: new google.maps.Point(wmid, h + labelOffset),
    url: url,
    size: new google.maps.Size(w, h),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(wmid, h),
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

exports.crosshair = function () {
  return {
    url: crosshairUrl,
    size: new google.maps.Size(64, 64),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(32, 32),
  };
};
