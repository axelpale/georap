var template = require('./template.ejs');
var ui = require('georap-ui');
var account = georap.stores.account;
var admin = georap.stores.admin;
var roles = georap.config.roles;
var __ = georap.i18n.__;

module.exports = function (user) {
  var self = this;

  this.bind = function ($mount) {

    $mount.html(template({
      user: user,
      roles: roles,
      __: __,
    }));

    // Prevent user trying to change his/her role
    var author = account.getName();

    var $cancel = $('#admin-user-role-cancel');
    var $edit = $('#admin-user-role-edit');
    var $error = $('#admin-user-role-error');
    var $form = $('#admin-user-role-form');
    var $success = $('#admin-user-role-success');
    var $noauto = $('#admin-user-role-noauto');

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

    $cancel.click(function (ev) {
      ev.preventDefault();
      // Hide and reset form
      ui.hide($form);
      reset();
    });

    $edit.click(function (ev) {
      ev.preventDefault();

      if (author === user.name) {
        ui.toggleHidden($noauto);
      } else {
        ui.toggleHidden($form);
        ui.hide($success);
      }
    });

    $form.submit(function (ev) {
      ev.preventDefault();
      var newRole = getSelectedRole();

      admin.setRole(user.name, newRole, function (err) {
        if (err) {
          console.error(err);
          ui.show($error);
          return;
        }

        ui.hide($form);
        ui.show($success);
        user.role = newRole;
        // Refresh
        self.unbind();
        self.bind($mount);
      });
    });

  };

  this.unbind = function () {
    var $cancel = $('#admin-user-role-cancel');
    var $edit = $('#admin-user-role-edit');
    var $form = $('#admin-user-role-form');

    $cancel.off();
    $edit.off();
    $form.off();
  };
};
