// Provides service for coordinate projections.
//
const proj4 = require('proj4');
const config = require('georap-config');

// Init
config.coordinateSystems.forEach((cordsys) => {
  const name = cordsys[0];
  const projection = cordsys[1];  // Proj4 projection definition string.

  proj4.defs(name, projection);
});

exports.hasCoordinateSystem = (name) => {
  const system = config.coordinateSystems.find((sys) => {
    return sys[0] === name;
  });

  if (system) {
    return true;
  }
  return false;
};

exports.getProjectionDefinition = (name) => {
  // Get the projection definition string for the coordinate system.
  //
  // Parameters
  //   name
  //     string
  //
  // Return a projection definition string.
  // Return null if unknown system.
  //
  const system = config.coordinateSystems.find((sys) => {
    return sys[0] === name;
  });

  if (!system) {
    return null;
  }

  return system[1];
};

exports.parseProjectionDefinition = (def) => {
  // Parse projection definition string and return a Proj instance.
  // The instance has the parsed definitions in its properties:
  //
  // Example
  //   > const def = '+proj=utm +zone=35 +ellps=GRS80 +units=m +no_defs'
  //   > parseProjectionDefinition(def)
  //   {
  //     projName: 'utm',
  //     zone: 35,
  //     ellps: 'GRS80',
  //     units: 'm',
  //     ...
  //   }
  //
  return new proj4.Proj(def);
};

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
