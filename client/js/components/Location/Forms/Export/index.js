
var tresdb = window.tresdb;
var ui = require('../../../lib/ui');
var account = require('../../../../stores/account');
var template = require('./template.ejs');
var emitter = require('component-emitter');

// Services that can be referenced by a link.
// Collect the templates here for simpler code.
// Some services require non-WGS84 coordinates.
// Location provides those via getAltGeom method.
var exportServices = tresdb.config.exportServices.map(function (serv) {
  var servName = serv[0];
  var servCoordSys = serv[2];

  return {
    name: servName,
    system: servCoordSys,
    template: tresdb.templates[servName],
  };
});


module.exports = function (location) {

  var self = this;
  emitter(self);

  self.bind = function ($mount) {

    // Compute service templates into URLs
    var exportServiceUrls = exportServices.map(function (es) {
      var coords = location.getAltGeom(es.system);
      var url = es.template({
        longitude: coords[0],
        latitude: coords[1],
      });

      return {
        name: es.name,
        url: url,
      };
    });

    // Render
    $mount.html(template({
      id: location.getId(),
      token: account.getToken(),
      services: exportServiceUrls,
    }));

    var $cont = $('#tresdb-export-container');
    var $show = $('#tresdb-export-show');
    var $cancel = $('#tresdb-export-cancel');

    $show.click(function (ev) {
      ev.preventDefault();
      ui.toggleHidden($cont);
    });

    $cancel.click(function (ev) {
      ev.preventDefault();
      ui.hide($cont);
    });
  };

  self.unbind = function () {
    var $show = $('#tresdb-export-show');
    var $cancel = $('#tresdb-export-cancel');

    $show.off();
    $cancel.off();
  };

};
