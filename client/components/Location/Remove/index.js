
var account = georap.stores.account;
var able = georap.stores.account.able;
var template = require('./template.ejs');
var components = require('georap-components');
var ui = require('georap-ui');

module.exports = function (location) {

  var $mount = null;
  var $elems = {};
  var children = {};
  var self = this;

  var userCanRemove = function () {
    // Allow only admins and creators to delete.
    if (able('locations-delete-any')) {
      return true;
    } else if (able('locations-delete-own')) {
      if (account.getName() === location.getCreator()) {
        return true;
      }
    }
    return false;
  };

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    if (!userCanRemove()) {
      return;
    }

    var __ = georap.i18n.__;

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
        // ON successful removal the location will emit "location_removed" event
        // and the card will close the Location component.
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
