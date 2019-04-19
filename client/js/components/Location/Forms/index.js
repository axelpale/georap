
var ExportComponent = require('./Export');
var EntryCreationComponent = require('../Entries/Creation');
var template = require('./template.ejs');
var emitter = require('component-emitter');


module.exports = function (location) {
  // Parameters:
  //   location
  //     models.Location object

  var self = this;
  emitter(self);

  // Child components
  var _entryCom = new EntryCreationComponent(location);
  var _exportCom = new ExportComponent(location);

  self.bind = function ($mount) {
    $mount.html(template({}));

    var $entryCont = $('#tresdb-entry-container-outer');
    var $exportCont = $('#tresdb-export-container-outer');

    // Bind child components
    _entryCom.bind($entryCont);
    _exportCom.bind($exportCont);
  };

  self.unbind = function () {
    _entryCom.unbind();
    _exportCom.unbind();
  };
};
