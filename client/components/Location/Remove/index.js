
var template = require('./template.ejs');
var components = require('georap-components');
var ui = require('georap-ui');
var __ = georap.i18n.__;

module.exports = function (location) {

  var $mount = null;
  var $elems = {};
  var children = {};
  var self = this;

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      location: location,
      __: __,
    }));

    children.remover = new components.Remover({
      cancelBtnText: __('cancel'),
      deleteBtnText: __('delete-ok'),
      infoText: '',
      youSureText: __('are-you-sure-cannot-undo'),
    });

    children.remover.bind({
      $container: $mount.find('.location-delete-container'),
      $button: $mount.find('.location-delete-opener'),
    });

    children.remover.on('submit', function () {
      location.remove(function (err) {
        if (children.remover) { // ensure mounted
          if (err) {
            var msg = err.message;
            if (err.message) {
              msg = err.message;
            } else {
              msg = __('connection-error');
            }
            // show error
            children.remover.error(msg);
            return;
          }

          children.remover.close();
          // ON successful removal the location will emit "location_removed"
          // and the card will close the Location component.
        }
      });
    });
  };

  self.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount = null;
    }
  };

};
