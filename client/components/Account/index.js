var template = require('./template.ejs');
var emitter = require('component-emitter');
var ThemeForm = require('./ThemeForm');
var ui = require('georap-ui');
var account = georap.stores.account;
var localesStore = georap.stores.locales;
var availableLocales = georap.config.availableLocales;

module.exports = function () {

  // Init
  var $mount = null;
  var self = this;
  emitter(self);
  var $elems = {};
  var children = {};

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    var user = account.getUser();
    $mount.html(template({
      username: user.name,
      email: user.email,
      currentLocale: localesStore.getLocale(),
      availableLocales: availableLocales,
      __: georap.i18n.__,
    }));

    children.theme = new ThemeForm();
    children.theme.bind($mount.find('.theme-form'));
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;
      ui.offAll($elems);
      $elems = {};
      ui.unbindAll(children);
      children = {};
    }
  };
};
