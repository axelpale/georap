// A HTML markup module for GeoJSON points. In addition to well formatted
// coordinate output, it creates a Wikipedia-favoured link to
// tools.wmflabs.org/geohack
//
// Usage example:
//   var p = { type: 'Point', coordinates: [-118.25013445, 34.05394492] }
//   var html = geostamp(p);
//
// Looks like:
//   34.053944° N, 118.250134° E
//
// Resulting markup:
//   <a href="https://tools.wmflabs.org/geohack/geohack.php
//            ?language=en&params=34.05394492;-118.25013445_type:landmark"
//      target="_blank">34.053944° N, 118.250134° E</a>

var DEFAULT_PRECISION = 6;
var DEFAULT_TARGET = '_blank';

module.exports = function (geom, options) {
  // Parameters:
  //   geom
  //     GeoJSON Point
  //   options
  //     optional object, with following properties:
  //       precision
  //         integer, number of decimals, default to 6
  //       target
  //         defaults to '_blank'. To open to the same tab, set to '_self'
  //
  // Return:
  //   html as string

  if (!options) {
    options = {};
  }

  if (!options.hasOwnProperty('precision')) {
    options.precision = DEFAULT_PRECISION;
  }

  if (!options.hasOwnProperty('target')) {
    options.target = DEFAULT_TARGET;
  }

  var lng = geom.coordinates[0];
  var lat = geom.coordinates[1];

  var lngChar = (lng >= 0) ? 'E' : 'W';
  var latChar = (lat >= 0) ? 'N' : 'S';

  var lngStr = lng.toFixed(options.precision) + '&deg; ' + lngChar;
  var latStr = lat.toFixed(options.precision) + '&deg; ' + latChar;

  var geohackHead = 'https://tools.wmflabs.org/geohack/geohack.php';
  var geohackNeck = '?language=en&params=';
  var geohackParams = lat + ';' + lng + '_type:landmark';
  var geohackUrl = geohackHead + geohackNeck + geohackParams;

  return '<a href="' + geohackUrl + '" target="' + options.target + '">' +
         latStr + ', ' + lngStr + '</a>';
};
