// Normalizes overlay data.

var sanitizeDescription = require('./sanitizeDescription');

module.exports = function (loc) {
  if (!('overlays' in loc)) {
    return [];
  }

  return loc.overlays.map(function (ol) {
    return {
      name: ol.name,
      description: sanitizeDescription(ol.description),
      href: ol.href,
      viewBoundScale: ol.viewBoundScale,
      latLonBox: ol.latLonBox,
    };
  });
};
