var template = require('./template.ejs');
var emitter = require('component-emitter');
var ThemeForm = require('../Account/ThemeForm');
var LocaleForm = require('../Account/LocaleForm');
var ui = require('georap-ui');

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

    $mount.html(template({
      __: georap.i18n.__,
    }));

    children.theme = new ThemeForm();
    children.theme.bind($mount.find('.theme-form'));

    children.locale = new LocaleForm();
    children.locale.bind($mount.find('.locale-form'));
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
