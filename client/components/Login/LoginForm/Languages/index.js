var emitter = require('component-emitter');
var ui = require('georap-ui');
var template = require('./template.ejs');
var config = georap.config;

module.exports = function () {

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      // Internationalization
      availableLocales: config.availableLocales,
      __: georap.i18n.__,
    }));
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
