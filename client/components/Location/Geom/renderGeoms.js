var geostamp = require('geostamp');
var systemTemplates = georap.templates;
var systems = georap.config.coordinateSystems;

module.exports = function (geoms) {
  // Coordinates in each registered coordinate system.
  //
  // Parameters
  //   geoms
  //     object key->value where
  //       key
  //         string, coordinate system name
  //       value
  //         array [<longitude>, <latitude>]
  //
  // Return
  //   array of objects, where each object has
  //     name
  //       string, name of coordinate system
  //     html
  //       string, loc's geom rendered as html
  //

  // Coordinate systems and their templates
  var systemNames = systems.map(function (sys) {
    return sys[0];
  });

  var allCoords = systemNames.map(function (sysName) {
    var coords = geoms[sysName];

    var tmplParams = {
      lat: coords[1],
      lng: coords[0],
      absLat: Math.abs(coords[1]),
      absLng: Math.abs(coords[0]),
      getLatDir: geostamp.latitudeDirection,
      getLngDir: geostamp.longitudeDirection,
      getD: geostamp.getDecimal,
      getDM: geostamp.getDM,
      getDMS: geostamp.getDMS,
    };

    var systemHtml = systemTemplates[sysName](tmplParams);

    return {
      name: sysName,
      html: systemHtml,
    };
  });

  return allCoords;
};
