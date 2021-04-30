/* eslint-disable no-magic-numbers */
var template = require('./template.ejs');
var emitter = require('component-emitter');
var exportsModel = require('georap-models').exports;

// Services that can be referenced by a link.
// Collect the templates here for simpler code.
// Some services require non-WGS84 coordinates.
// Location provides those via getAltGeom method.
var simplifiedExportServices = exportsModel.getSimplified(
  tresdb.config.exportServices,
  tresdb.templates
);

module.exports = function () {

  var self = this;
  emitter(self);
  var $mount = null;

  self.bind = function ($mountEl) {
    $mount = $mountEl;
    // Render
    $mount.html(template());
  };

  self.updateGeometry = function (geoms) {
    if ($mount) {
      // Select services available for this location
      var availableServices = exportsModel.getAvailableServices(
        simplifiedExportServices,
        geoms
      );

      // Compute services into URLs
      var exportServiceUrls = exportsModel.getServiceUrls(
        availableServices,
        geoms
      );

      var servHtml = exportsModel.getServiceButtons(exportServiceUrls);
      $mount.find('.crosshair-viewon-services').html(servHtml);
    }
  };

  self.unbind = function () {
    // noop
  };

};
