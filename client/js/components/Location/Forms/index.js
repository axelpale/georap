
var ExportComponent = require('./Export');
var ViewOnComponent = require('./ViewOn');
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
  var _viewOnCom = new ViewOnComponent(location);

  self.bind = function ($mount) {
    $mount.html(template({}));

    var $entryCont = $('#tresdb-entry-container-outer');
    var $exportCont = $('#tresdb-export-container-outer');
    var $viewOnCont = $('#tresdb-viewon-container-outer');

    // Bind child components
    _entryCom.bind($entryCont);
    _exportCom.bind($exportCont);
    _viewOnCom.bind($viewOnCont);
  };

  self.unbind = function () {
    _entryCom.unbind();
    _exportCom.unbind();
    _viewOnCom.unbind();
  };
};
