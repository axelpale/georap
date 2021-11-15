// Component to display coordinates in all available coordinate systems.
//
var geostamp = require('geostamp');
var template = require('./template.ejs');

var coordinateSystems = georap.config.coordinateSystems;
var coordinateTemplates = georap.templates;

var prerenderGeoms = function (geoms) {
  // Parameters:
  //   geoms
  //     system name -> [x, y]
  //       where x is longitude or easting
  //             y is latitude or northing
  //
  // Return
  //   array of { name, html } objects
  //     name: coordinate system name
  //     html: coordinates rendered in system-specific way
  //
  return coordinateSystems.map(function (coordSystem) {
    var systemName = coordSystem[0];
    var systemCoords = geoms[systemName];
    var y = systemCoords[1];
    var x = systemCoords[0];
    var systemTemplate = coordinateTemplates[systemName];
    var coordsHtml = geostamp.html(systemTemplate, y, x);
    return {
      name: systemName,
      html: coordsHtml,
    };
  });
};

module.exports = function () {
  // Init

  var _$mount = null;

  // Public methods

  this.bind = function ($mount) {
    _$mount = $mount;
    _$mount.html(template({
      prerendered: [],
    }));
  };

  this.updateGeometry = function (geoms) {
    if (_$mount) {
      _$mount.html(template({
        prerendered: prerenderGeoms(geoms),
      }));
    }
  };

  this.unbind = function () {
    _$mount = null;
  };
};
