
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
      services: exportServiceUrls,
    }));

    var $cont = $('#tresdb-viewon-container');
    var $show = $('#tresdb-viewon-show');
    var $cancel = $('#tresdb-viewon-cancel');

    $show.click(function (ev) {
      ev.preventDefault();
      tresdb.ui.toggleHidden($cont);
      // Prevent both export and viewon being open at the same time.
      tresdb.ui.hide($('#tresdb-export-container'));
    });

    $cancel.click(function (ev) {
      ev.preventDefault();
      tresdb.ui.hide($cont);
    });
  };

  self.unbind = function () {
    var $show = $('#tresdb-viewon-show');
    var $cancel = $('#tresdb-viewon-cancel');

    $show.off();
    $cancel.off();
  };

};
