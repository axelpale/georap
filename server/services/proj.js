// Provides service for coordinate projections.
//
const proj4 = require('proj4');
const config = require('tresdb-config');

// Init
config.coordinateSystems.forEach((cordsys) => {
  const name = cordsys[0];
  const projection = cordsys[1];  // Proj4 projection definition string.

  proj4.defs(name, projection);
});

exports.getAltPositions = function (position) {
  //
  // Parameters:
  //   position
  //     [lng, lat]
  //
  // Return
  //   map from coordinate system names to projected coordinates.
  //
  const result = {};

  config.coordinateSystems.forEach((cordsys) => {
    const name = cordsys[0];

    result[name] = proj4(name, position);
  });

  return result;
};

exports.projectFrom = function (name, position) {
  // Project from the named coordinate system to WGS84.
  //
  // Parameters:
  //   name
  //   position
  //     [lng, lat]
  //

  return proj4(name).inverse(position);
};

exports.projectTo = function (name, position) {
  // Project from WGS84 to the named coordinate system.
  //
  // Parameters:
  //   name
  //   position
  //     [lng, lat]
  //

  return proj4(name, position);
};
