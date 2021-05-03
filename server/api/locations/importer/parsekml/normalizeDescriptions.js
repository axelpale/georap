const sanitizeDescription = require('./sanitizeDescription');
const parseCoordinate = require('./parseCoordinate');
const _ = require('lodash');

// Coordinate comparison precision in number of characters
const PREC = 8;

module.exports = function (loc, avgLonLat) {
  let combined = [];

  // Combine descriptions
  if ('descriptions' in loc) {
    combined = loc.descriptions;
  }
  if ('description' in loc) {
    combined.push(loc.description);
  }

  // Convert extended data to description
  combined.push(loc.extendedData.reduce((acc, extItem) => {
    return acc + '<strong>' + extItem.name + ':</strong>' +
      ' ' + extItem.value + '<br>';
  }, ''));

  // Remove empty descriptions
  const nonempty = combined.filter((desc) => {
    return desc.length > 0;
  });

  // Convert descriptions to markdown. Remove all remaining HTML.
  const sanitized = nonempty.map(sanitizeDescription);

  // Remove duplicate descriptions
  const unique = _.uniq(sanitized);

  // Remove descriptions that only repeat the location coordinates
  const valuable = unique.filter((desc) => {
    let a, b, c, d;
    const coord = parseCoordinate(desc);
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
