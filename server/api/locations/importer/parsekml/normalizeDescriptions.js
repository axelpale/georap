var sanitizeDescription = require('./sanitizeDescription');
var parseCoordinate = require('./parseCoordinate');
var _ = require('lodash');

// Coordinate comparison precision in number of characters
var PREC = 8;

module.exports = function (loc, avgLonLat) {
  var combined = [];

  // Combine descriptions
  if (loc.hasOwnProperty('descriptions')) {
    combined = loc.descriptions;
  }
  if (loc.hasOwnProperty('description')) {
    combined.push(loc.description);
  }

  // Convert extended data to description
  combined.push(loc.extendedData.reduce(function (acc, extItem) {
    return acc + '<strong>' + extItem.name + ':</strong>' +
      ' ' + extItem.value + '<br>';
  }, ''));

  // Remove empty descriptions
  var nonempty = combined.filter(function (desc) {
    return desc.length > 0;
  });

  // Convert descriptions to markdown. Remove all remaining HTML.
  var sanitized = nonempty.map(sanitizeDescription);

  // Remove duplicate descriptions
  var unique = _.uniq(sanitized);

  // Remove descriptions that only repeat the location coordinates
  var valuable = unique.filter(function (desc) {
    var a, b, c, d;
    var coord = parseCoordinate(desc);
    if (coord) {
      // Do not care about the lat, lng order
      a = coord[0].toFixed(PREC);
      b = coord[1].toFixed(PREC);
      c = avgLonLat[0].toFixed(PREC);
      d = avgLonLat[1].toFixed(PREC);
      if ((a === c && b === d) || (a === d && b === c)) {
        // Coordinate is just a repetition
        return false;
      }
    }
    return true;
  });

  return valuable;
};
