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

    children.error = new components.Error();
    children.error.bind($mount.find('.user-removal-error'));

    children.remover.on('submit', function () {
      var username = user.name;
      adminApi.removeUser(username, function (err) {
        if (err) {
          children.remover.close();
          if (err.code === FORBIDDEN) {
            children.error.update(err.message);
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
