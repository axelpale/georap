
var ExportComponent = require('./Export');
var PostComponent = require('./Post');
var template = require('./template.ejs');
var emitter = require('component-emitter');


module.exports = function (location) {
  // Parameters:
  //   location
  //     models.Location object

  var self = this;
  emitter(self);

  // Child components
  var _postCom = new PostComponent(location);
  var _exportCom = new ExportComponent(location);

  self.bind = function ($mount) {
    $mount.html(template({}));

    var $postCont = $('#tresdb-entry-container-outer');
    var $exportCont = $('#tresdb-export-container-outer');

    // Bind child components
    _postCom.bind($postCont);
    _exportCom.bind($exportCont);
  };

  self.unbind = function () {
    _postCom.unbind();
    _exportCom.unbind();
  };
};
