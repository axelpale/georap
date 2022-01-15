var template = require('./template.ejs');
var ui = require('georap-ui');
var components = require('georap-components');
var adminApi = georap.stores.admin;
var __ = georap.i18n.__;

module.exports = function (user) {
  var $mount = null;
  var children = {};
  var $elems = {};

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      __: __,
    }));

    children.remover = new components.Remover({
      infoText: __('user-removal-info'),
      youSureText: __('user-removal-you-sure'),
      cancelBtnText: __('cancel'),
      deleteBtnText: __('user-removal-submit-btn'),
    });

    children.remover.bind({
      $container: $mount.find('.user-removal-container'),
      $button: $mount.find('.user-removal-opener'),
    });

    children.remover.on('submit', function () {
      adminApi.removeUser({
        username: user.name,
      }, function (err) {
        if (err) {
          children.remove.reset(); // hide progress
          children.error.update(err.message);
          return;
        }
        console.log('user removed');
        // TODO Global user_removed will cause unbind
        // and $mount removal.
      });
    });
  };

  this.unbind = function () {
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
