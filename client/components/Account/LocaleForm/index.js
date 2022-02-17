var ui = require('georap-ui');
var template = require('./template.ejs');
var localesStore = georap.stores.locales;
var availableLocales = georap.config.availableLocales;

module.exports = function () {

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      currentLocale: localesStore.getLocale(),
      availableLocales: availableLocales,
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
