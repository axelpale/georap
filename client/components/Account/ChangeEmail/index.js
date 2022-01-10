var emitter = require('component-emitter');
var ui = require('georap-ui');
var template = require('./template.ejs');
var account = georap.stores.account;

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
      email: account.getUser().email,
      __: georap.i18n.__,
    }));

    $elems.btn = $mount.find('.boilerplate-btn');
    $elems.btn.click(function () {
      console.log('Button clicked');
    });
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