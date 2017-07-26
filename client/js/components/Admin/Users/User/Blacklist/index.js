var template = require('./template.ejs');
var account = tresdb.stores.account;
var admin = tresdb.stores.admin;

module.exports = function (user) {
  var self = this;

  this.bind = function ($mount) {

    $mount.html(template({
      username: user.name,
      isBlacklisted: user.isBlacklisted,
    }));

    // Prevent user trying to blacklist him/herself
    var author = account.getName();

    var $box = $('#blacklist-checkbox');
    var $cancel = $('#tresdb-admin-user-blacklist-cancel');
    var $edit = $('#tresdb-admin-user-blacklist-edit');
    var $error = $('#tresdb-admin-user-blacklist-error');
    var $form = $('#tresdb-admin-user-blacklist-form');
    var $success = $('#tresdb-admin-user-blacklist-success');
    var $noauto = $('#tresdb-admin-user-blacklist-noauto');

    $cancel.click(function (ev) {
      ev.preventDefault();
      // Hide and reset form
      tresdb.ui.hide($form);
      $box.prop('checked', user.isBlacklisted);
    });

    $edit.click(function (ev) {
      ev.preventDefault();

      if (author === user.name) {
        tresdb.ui.toggleHidden($noauto);
      } else {
        tresdb.ui.toggleHidden($form);
        tresdb.ui.hide($success);
      }
    });

    $form.submit(function (ev) {
      ev.preventDefault();

      var isChecked = $box.prop('checked');

      if (typeof isChecked !== 'boolean') {
        throw new Error('Invalid bool isChecked: ' + isChecked);
      }

      admin.setBlacklisted(user.name, isChecked, function (err) {
        if (err) {
          console.error(err);
          tresdb.ui.show($error);
          return;
        }

        tresdb.ui.hide($form);
        tresdb.ui.show($success);
        user.isBlacklisted = isChecked;
        self.unbind();
        self.bind($mount);
      });
    });

  };

  this.unbind = function () {

    var $cancel = $('tresdb-admin-user-blacklist-cancel');
    var $edit = $('tresdb-admin-user-blacklist-edit');
    var $form = $('tresdb-admin-user-blacklist-form');

    $cancel.off();
    $edit.off();
    $form.off();
  };
};
