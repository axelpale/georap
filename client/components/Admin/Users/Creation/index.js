// Form for user creation without invitation and without email.
//
var emitter = require('component-emitter');
var ui = require('georap-ui');
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

    $mount.html(template({
      __: georap.i18n.__,
    }));

    $elems.cancel = $mount.find('.user-creation-cancel');
    $elems.cancel.click(function () {
      self.emit('cancel');
    });

    $elems.form = $mount.find('.user-creation-form');
    $elems.form.submit(function () {
      // adminApi.createUser({
      //   name:
      //   email:
      //   password:
      //   role:
      // })
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
