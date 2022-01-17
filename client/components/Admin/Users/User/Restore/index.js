var template = require('./template.ejs');
var ui = require('georap-ui');
var components = require('georap-components');
var emitter = require('component-emitter');
var adminApi = georap.stores.admin;
var __ = georap.i18n.__;
var FORBIDDEN = 403;

module.exports = function (user) {
  var self = this;
  var $mount = null;
  var children = {};
  var $elems = {};
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      __: __,
    }));

    $elems.button = $mount.find('.user-restore-btn');

    children.restorer = new components.Remover({
      infoText: __('user-restore-info'),
      youSureText: __('user-restore-you-sure'),
      cancelBtnText: __('cancel'),
      deleteBtnText: __('user-restore-submit-btn'),
    });

    children.restorer.bind({
      $container: $mount.find('.user-restore-container'),
      $button: $mount.find('.user-restore-opener'),
    });

    children.error = new components.Error();
    children.error.bind($mount.find('.user-restore-error'));

    children.restorer.on('submit', function () {
      var username = user.name;
      adminApi.restoreUser(username, function (err) {
        if (err) {
          children.restorer.close();
          if (err.code === FORBIDDEN) {
            children.error.update(__('user-restore-noauto'));
          } else {
            children.error.update(err.message);
          }
          return;
        }

        self.emit('success');
        // TODO Global user_removed will cause unbind
        // and $mount removal.
      });
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
