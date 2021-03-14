// Component to filter map markers.
//
var geostamp = require('geostamp');
var template = require('./template.ejs');

var coordinateSystems = tresdb.config.coordinateSystems;
var coordinateTemplates = tresdb.templates;

var prerenderGeoms = function (geoms) {
  // Parameters:
  //   geoms
  //     system name -> [lng, lat]
  //
  // Return
  //   array of { name, html } objects
  //     name: coordinate system name
  //     html: coordinates rendered in system-specific way
  //
  return coordinateSystems.map(function (coordSystem) {
    var systemName = coordSystem[0];
    var systemCoords = geoms[systemName];
    var lat = systemCoords[1];
    var lng = systemCoords[0];
    var systemTemplate = coordinateTemplates[systemName];
    var coordsHtml = geostamp.html(systemTemplate, lat, lng);
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
