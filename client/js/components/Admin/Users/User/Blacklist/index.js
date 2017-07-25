var template = require('./template.ejs');
var admin = tresdb.stores.admin;

module.exports = function (user) {

  this.bind = function ($mount) {

    $mount.html(template({
      username: user.name,
      isBlacklisted: user.isBlacklisted,
    }));


    var $box = $('#blacklist-checkbox');
    var $cancel = $('#tresdb-admin-user-blacklist-cancel');
    var $edit = $('#tresdb-admin-user-blacklist-edit');
    var $error = $('#tresdb-admin-user-blacklist-error');
    var $form = $('#tresdb-admin-user-blacklist-form');
    var $success = $('#tresdb-admin-user-blacklist-success');


    $cancel.click(function (ev) {
      ev.preventDefault();
      // Hide and reset form
      tresdb.ui.hide($form);
      $box.prop('checked', user.isBlacklisted);
    });

    $edit.click(function (ev) {
      ev.preventDefault();
      tresdb.ui.toggleHidden($form);
      tresdb.ui.hide($success);
    });

    $form.submit(function (ev) {
      ev.preventDefault();

      var isChecked = $box.prop('checked');

      admin.setBlacklisted(user.name, isChecked, function (err) {
        if (err) {
          console.error(err);
          tresdb.ui.show($error);
          return;
        }

        tresdb.ui.hide($form);
        tresdb.ui.show($success);
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
