var template = require('./template.ejs');
var emitter = require('component-emitter');
var noautoError = require('./noautoError.ejs');
var ui = require('georap-ui');
var account = georap.stores.account;
var admin = georap.stores.admin;
var roles = georap.config.roles;
var __ = georap.i18n.__;

module.exports = function (user) {
  var $mount = null;
  var self = this;
  var $elems = {};
  emitter(self);

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    // Prevent user trying to change his/her role
    var author = account.getName();
    if (author === user.name) {
      $mount.html(noautoError({
        __: __,
      }));
      return;
    }

    var authorRole = account.getRole();
    var authorRoleIndex = roles.indexOf(authorRole);

    $mount.html(template({
      user: user,
      roles: roles,
      authorRoleIndex: authorRoleIndex,
      __: __,
    }));

    $elems.cancel = $('#admin-user-role-cancel');
    $elems.error = $('#admin-user-role-error');
    $elems.form = $('#admin-user-role-form');
    $elems.success = $('#admin-user-role-success');
    $elems.noauto = $('#admin-user-role-noauto');

    var getSelectedRole = function () {
      return $mount.find('.radio input[name=\'userRole\']:checked').val();
    };

    $elems.cancel.click(function (ev) {
      ev.preventDefault();
      ui.resetRadio($elems.form, user.role);
      self.emit('cancel');
    });

    $elems.form.submit(function (ev) {
      ev.preventDefault();
      var newRole = getSelectedRole();

      admin.setRole(user.name, newRole, function (err) {
        if (err) {
          $elems.error.html(err.message);
          ui.show($elems.error);
          return;
        }

        ui.hide($elems.form);
        ui.show($elems.success);
        user.role = newRole;
        // Bubble up
        self.emit('success');
        // Refresh
        self.unbind();
        self.bind($mountEl);
      });
    });

  };

  this.unbind = function () {
    if ($mount) {
      ui.offAll($elems);
      $elems = {};
      $mount.empty();
      $mount = null;
    }
  };
};
