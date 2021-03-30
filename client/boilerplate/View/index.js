var ui = require('tresdb-ui');
var template = require('./template.ejs');

module.exports = function () {

  // Setup
  var self = this;
  var $mount = null;
  var children = {};
  var $elems = {};

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({}));
  };

  self.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
    }
  };
};
