// A HTML markup module for GeoJSON points. In addition to well formatted
// coordinate output, it creates a Wikipedia-favoured link to
// tools.wmflabs.org/geohack
//
// Usage example:
//   var p = { type: 'Point', coordinates: [-118.25013445, 34.05394492] }
//   var html = geostamp.geohack(p);
//
// Looks like:
//   34.053944° N, 118.250134° E
//
// Resulting markup:
//   <a href="https://tools.wmflabs.org/geohack/geohack.php
//            ?language=en&params=34.05394492;-118.25013445_type:landmark"
//      target="_blank">34.053944° N, 118.250134° E</a>

var DEFAULT_PRECISION = 6;
var MINUTE_PRECISION = 4;
var SECOND_PRECISION = 2;
var DEFAULT_TARGET = '_blank';

var MINUTES = 60;
var SECONDS = 60;

exports.latitudeDirection = function (lat) {
  return (lat >= 0) ? 'N' : 'S';
};

exports.longitudeDirection = function (lng) {
  return (lng >= 0) ? 'E' : 'W';
};

exports.getDecimal = function (degrees) {
  // Get degrees in decimal degree format.
  //
  // Parameters:
  //   degrees
  //     number
  //
  return degrees.toFixed(DEFAULT_PRECISION) + '&deg;';
};

exports.getDM = function (degrees) {
  // Get degrees in degree minute format.
  var degs = Math.floor(degrees);
  var degsRemainder = degrees - degs;
  var mins = degsRemainder * MINUTES;

  return degs + '&deg; ' + mins.toFixed(MINUTE_PRECISION) + '\'';
};

exports.getDMS = function (degrees) {
  // Get degrees in degree minute second format.
  //
  // Parameters:
  //   degrees
  //     number
  //

  var degs = Math.floor(degrees);
  var degsRemainder = degrees - degs;
  var mins = Math.floor(degsRemainder * MINUTES);
  var minsRemainder = degsRemainder - (mins / MINUTES);
  var secs = minsRemainder * MINUTES * SECONDS;

  return degs + '&deg; ' + mins + '\' ' + secs.toFixed(SECOND_PRECISION) + '"';
};

exports.geomDecimal = function (geom) {
  // Get geom in decimal degree format

  var lng = geom.coordinates[0];
  var lat = geom.coordinates[1];

  var lngStr = exports.getDecimal(lng);
  var latStr = exports.getDecimal(lat);

  var lngChar = exports.longitudeDirection(lng);
  var latChar = exports.latitudeDirection(lat);

  return latStr + ' ' + latChar + ', ' + lngStr + ' ' + lngChar;
};

exports.geomDM = function (geom) {
  // Get geom in degree minute format.

  var lng = geom.coordinates[0];
  var lat = geom.coordinates[1];

  var lngStr = exports.getDM(lng);
  var latStr = exports.getDM(lat);

  var lngChar = exports.longitudeDirection(lng);
  var latChar = exports.latitudeDirection(lat);

  return latStr + ' ' + latChar + ', ' + lngStr + ' ' + lngChar;
};

exports.geomDMS = function (geom) {
  // Get geom in degree minute second format.

  var lng = geom.coordinates[0];
  var lat = geom.coordinates[1];

  var lngStr = exports.getDMS(lng);
  var latStr = exports.getDMS(lat);

  var lngChar = exports.longitudeDirection(lng);
  var latChar = exports.latitudeDirection(lat);

  return latStr + ' ' + latChar + ', ' + lngStr + ' ' + lngChar;
};

exports.geohackUrl = function (geom) {
  // Return GeoHack URL.
  //
  // Return
  //   string, a url
  //
  var lng = geom.coordinates[0];
  var lat = geom.coordinates[1];

  var geohackHead = 'https://tools.wmflabs.org/geohack/geohack.php';
  var geohackNeck = '?language=en&params=';
  var geohackParams = lat + ';' + lng + '_type:landmark';

  return geohackHead + geohackNeck + geohackParams;
};

exports.geohackLink = function (geom, options) {
  // Create GeoHack link.
  //
  // Parameters:
  //   geom
  //     GeoJSON Point
  //   options
  //     optional object, with following properties:
  //       target
  //         defaults to '_blank'. To open to the same tab, set to '_self'
  //
  // Return:
  //   html as string

  if (!options) {
    options = {};
  }

  if (!('target' in options)) {
    options.target = DEFAULT_TARGET;
  }

  var decimalDegree = exports.geomDecimal(geom);
  var geohackUrl = exports.geohackUrl(geom);

  return '<a href="' + geohackUrl + '" target="' + options.target + '">' +
         decimalDegree + '</a>';
};
