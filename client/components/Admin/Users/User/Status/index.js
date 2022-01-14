var template = require('./template.ejs');
var ui = require('georap-ui');
var account = georap.stores.account;
var admin = georap.stores.admin;
var __ = georap.i18n.__;

module.exports = function (user) {
  var self = this;

  this.bind = function ($mount) {

    $mount.html(template({
      username: user.name,
      status: user.status,
      __: __,
    }));

    var $box = $('#status-checkbox');
    var $cancel = $('#admin-user-status-cancel');
    var $edit = $('#admin-user-status-edit');
    var $error = $('#admin-user-status-error');
    var $form = $('#admin-user-status-form');
    var $success = $('#admin-user-status-success');
    var $noauto = $('#admin-user-status-noauto');

    $cancel.click(function (ev) {
      ev.preventDefault();
      // Hide and reset form
      ui.hide($form);
      $box.prop('checked', user.status === 'active');
    });

    $edit.click(function (ev) {
      ev.preventDefault();

      // Prevent user trying to deactivate him/herself
      var author = account.getName();

      if (author === user.name) {
        ui.toggleHidden($noauto);
      } else {
        ui.toggleHidden($form);
        ui.hide($success);
      }
    });

    $form.submit(function (ev) {
      ev.preventDefault();

      var isChecked = $box.prop('checked');

      if (typeof isChecked !== 'boolean') {
        throw new Error('Invalid bool isChecked: ' + isChecked);
      }

      // isChecked is false <=> status is active
      admin.setStatus(user.name, !isChecked, function (err) {
        if (err) {
          console.error(err);
          ui.show($error);
          return;
        }

        ui.hide($form);
        ui.show($success);
        user.status = isChecked ? 'deactivated' : 'active';
        self.unbind();
        self.bind($mount);
      });
    });

  };

  this.unbind = function () {
    $('admin-user-status-cancel').off();
    $('admin-user-status-edit').off();
    $('admin-user-status-form').off();
  };
};
