var template = require('./template.ejs');
var ui = require('georap-ui');
var account = georap.stores.account;
var admin = georap.stores.admin;
var __ = georap.i18n.__;

module.exports = function (user) {
  var $mount = null;
  var self = this;
  var $elems = {};

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      username: user.name,
      status: user.status,
      __: __,
    }));

    $elems.box = $('#status-checkbox');
    $elems.cancel = $('#admin-user-status-cancel');
    $elems.edit = $('#admin-user-status-edit');
    $elems.error = $('#admin-user-status-error');
    $elems.form = $('#admin-user-status-form');
    $elems.success = $('#admin-user-status-success');
    $elems.noauto = $('#admin-user-status-noauto');

    $elems.cancel.click(function (ev) {
      ev.preventDefault();
      // Hide and reset form
      ui.hide($elems.form);
      $elems.box.prop('checked', user.status === 'active');
    });

    $elems.edit.click(function (ev) {
      ev.preventDefault();

      // Prevent user trying to deactivate him/herself
      var author = account.getName();

      if (author === user.name) {
        ui.toggleHidden($elems.noauto);
      } else {
        ui.toggleHidden($elems.form);
        ui.hide($elems.success);
      }
    });

    $elems.form.submit(function (ev) {
      ev.preventDefault();

      var isChecked = $elems.box.prop('checked');

      if (typeof isChecked !== 'boolean') {
        throw new Error('Invalid bool isChecked: ' + isChecked);
      }

      // isChecked is false <=> status is active
      admin.setStatus(user.name, !isChecked, function (err) {
        if (err) {
          console.error(err);
          ui.show($elems.error);
          return;
        }

        ui.hide($elems.form);
        ui.show($elems.success);
        user.status = isChecked ? 'deactivated' : 'active';
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
