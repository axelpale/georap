var template = require('./template.ejs');
var ui = require('georap-ui');
var account = georap.stores.account;
var admin = georap.stores.admin;
var roles = georap.config.roles;
var __ = georap.i18n.__;

module.exports = function (user) {
  var $mount = null;
  var self = this;
  var $elems = {};

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      user: user,
      roles: roles,
      __: __,
    }));

    // Prevent user trying to change his/her role
    var author = account.getName();

    $elems.cancel = $('#admin-user-role-cancel');
    $elems.edit = $('#admin-user-role-edit');
    $elems.error = $('#admin-user-role-error');
    $elems.form = $('#admin-user-role-form');
    $elems.success = $('#admin-user-role-success');
    $elems.noauto = $('#admin-user-role-noauto');

    var reset = function () {
      $mount.find('.radio input').each(function (el) {
        if (el.value === user.role) {
          el.checked = true;
        } else {
          el.checked = false;
        }
      });
    };

    var getSelectedRole = function () {
      return $mount.find('.radio input[name=\'userRole\']:checked').val();
    };

    $elems.cancel.click(function (ev) {
      ev.preventDefault();
      // Hide and reset form
      ui.hide($elems.form);
      reset();
    });

    $elems.edit.click(function (ev) {
      ev.preventDefault();

      if (author === user.name) {
        ui.toggleHidden($elems.noauto);
      } else {
        ui.toggleHidden($elems.form);
        ui.hide($elems.success);
      }
    });

    $elems.form.submit(function (ev) {
      ev.preventDefault();
      var newRole = getSelectedRole();

      admin.setRole(user.name, newRole, function (err) {
        if (err) {
          console.error(err);
          ui.show($elems.error);
          return;
        }

        ui.hide($elems.form);
        ui.show($elems.success);
        user.role = newRole;
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
