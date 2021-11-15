var template = require('./template.ejs');
var ui = require('georap-ui');
var account = georap.stores.account;
var admin = georap.stores.admin;

module.exports = function (user) {
  var self = this;

  this.bind = function ($mount) {

    $mount.html(template({
      username: user.name,
      isAdmin: user.admin,
    }));

    // Prevent user trying to change his/her role
    var author = account.getName();

    var $radioAdmin = $('#role-radio-admin');
    var $radioBasic = $('#role-radio-basic');
    var $cancel = $('#tresdb-admin-user-role-cancel');
    var $edit = $('#tresdb-admin-user-role-edit');
    var $error = $('#tresdb-admin-user-role-error');
    var $form = $('#tresdb-admin-user-role-form');
    var $success = $('#tresdb-admin-user-role-success');
    var $noauto = $('#tresdb-admin-user-role-noauto');

    var reset = function () {
      $radioAdmin.prop('checked', user.admin);
      $radioBasic.prop('checked', !user.admin);
    };

    var willBeAdmin = function () {
      return $radioAdmin.prop('checked');
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

      admin.setRole(user.name, willBeAdmin(), function (err) {
        if (err) {
          console.error(err);
          ui.show($error);
          return;
        }

        ui.hide($form);
        ui.show($success);
        user.admin = willBeAdmin();
        // Refresh
        self.unbind();
        self.bind($mount);
      });
    });

  };

  this.unbind = function () {
    var $cancel = $('tresdb-admin-user-role-cancel');
    var $edit = $('tresdb-admin-user-role-edit');
    var $form = $('tresdb-admin-user-role-form');

    $cancel.off();
    $edit.off();
    $form.off();
  };
};
