var template = require('./template.ejs');
var ui = require('georap-ui');
var components = require('georap-components');
var RoleForm = require('./RoleForm');
var __ = georap.i18n.__;

module.exports = function (user) {
  var $mount = null;
  var self = this;
  var $elems = {};
  var children = {};

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      user: user,
      __: __,
    }));

    var formComp = new RoleForm(user);
    children.opener = new components.Opener(formComp, false);
    children.opener.bind({
      $container: $mount.find('.admin-user-role-form-container'),
      $button: $mount.find('.admin-user-role-edit'),
    });
    children.opener.on('success', function () {
      // Rerender component.
      self.unbind();
      self.bind($mountEl);
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
