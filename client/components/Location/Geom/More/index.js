
var ui = require('georap-ui');
var emitter = require('component-emitter');
var template = require('./template.ejs');

module.exports = function (geostamps) {

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      geostamps: geostamps,
    }));
  };

  self.update = function (newGeostamps) {
    geostamps = newGeostamps;
    if ($mount) {
      $mount.html(template({
        geostamps: geostamps,
      }));
    }
  };

  self.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount.empty();
      $mount = null;
    }
  };
};
