var emitter = require('component-emitter');
var ui = require('georap-ui');
var template = require('./template.ejs');

module.exports = function (location) {
  // Parameters
  //   location
  //     LocationModel
  //

  // Setup
  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  self.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      name: location.getName(), // Prefill with current name
      __: georap.i18n.__,
    }));

    $elems.form = $mount.find('.location-rename-form');
    $elems.error = $mount.find('.location-rename-error');
    $elems.input = $mount.find('#location-rename-input');
    $elems.cancel = $mount.find('.location-rename-cancel');
    $elems.progress = $mount.find('.location-rename-progress');

    // Focus to input field
    $elems.input.focus();

    $elems.cancel.click(function (ev) {
      ev.preventDefault();
      self.emit('cancel');
    });

    $elems.form.submit(function (ev) {
      ev.preventDefault();

      // Hide form, display progress
      ui.hide($elems.form);
      ui.show($elems.progress);

      var newName = $elems.input.val().trim();
      var oldName = location.getName();

      if (newName === oldName) {
        // If name not changed, just close the form.
        self.emit('cancel');
        return;
      }

      location.setName(newName, function (err) {
        ui.hide($elems.progress);

        if (err) {
          console.error(err);
          ui.show($elems.error);
          return;
        }

        self.emit('finish');
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
