
const geojson = require('./geojson');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

const precompile = function (templatePath) {
  // Precompile template.
  //
  // Parameters:
  //   templatePath
  //     relative path e.g. './gpx.ejs'
  //
  // Return:
  //   function
  //
  const p = path.resolve(__dirname, templatePath);
  const f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync

  return ejs.compile(f);
};

const toGpx = precompile('./gpx.ejs');
const toKml = precompile('./kml.ejs');


exports.geojson = geojson;

exports.gpx = function (loc) {
  return toGpx({
    name: loc.name,
    longitude: loc.geom.coordinates[0],
    latitude: loc.geom.coordinates[1],
  });
};

exports.kml = function (loc) {
  return toKml({
    name: loc.name,
    longitude: loc.geom.coordinates[0],
    latitude: loc.geom.coordinates[1],
  });
};
