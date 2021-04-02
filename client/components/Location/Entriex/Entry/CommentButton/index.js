var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var template = require('./template.ejs');

module.exports = function () {

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template());

    $elems.open = $mount.find('.comment-form-open');
    $elems.open.click(function () {
      $elems.open.off(); // prevent double click
      self.emit('open');
    });
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
