
var geojson = require('./geojson');
var fs = require('fs');
var path = require('path');
var ejs = require('ejs');

var precompile = function (templatePath) {
  // Precompile template.
  //
  // Parameters:
  //   templatePath
  //     relative path e.g. './gpx.ejs'
  //
  // Return:
  //   function
  //
  var p = path.resolve(__dirname, templatePath);
  var f = fs.readFileSync(p, 'utf8');  // eslint-disable-line no-sync

  return ejs.compile(f);
};

var toGpx = precompile('./gpx.ejs');
var toKml = precompile('./kml.ejs');


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
