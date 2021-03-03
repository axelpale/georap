
var ExportComponent = require('./Export');
var ViewOnComponent = require('./ViewOn');
var EntryCreationComponent = require('../Entriex/Creation');
var template = require('./template.ejs');
var emitter = require('component-emitter');


module.exports = function (location) {
  // Parameters:
  //   location
  //     models.Location object

  var self = this;
  emitter(self);

  // Child components
  var _entryCom;
  var _exportCom = new ExportComponent(location);
  var _viewOnCom = new ViewOnComponent(location);

  self.bind = function ($mount) {
    $mount.html(template({}));

    var $entryCreationOpen = $('#entry-creation-open');
    var $entryCreationContainer = $('#entry-creation-container');

    var exitEntryCreation = function () {
      if (_entryCom) {
        _entryCom.unbind();
        $entryCreationContainer.empty();
        _entryCom = null;
      }
    };

    $entryCreationOpen.click(function () {
      if (_entryCom) {
        exitEntryCreation();
      } else {
        _entryCom = new EntryCreationComponent(location);
        _entryCom.bind($entryCreationContainer);
        _entryCom.once('exit', exitEntryCreation);
      }
    });

    var $exportCont = $('#tresdb-export-container-outer');
    var $viewOnCont = $('#tresdb-viewon-container-outer');

    // Bind child components
    _exportCom.bind($exportCont);
    _viewOnCom.bind($viewOnCont);
  };

  self.unbind = function () {
    _entryCom.unbind();
    _exportCom.unbind();
    _viewOnCom.unbind();
  };
};
