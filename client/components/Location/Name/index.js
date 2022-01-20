var template = require('./template.ejs');
var ui = require('georap-ui');
var __ = georap.i18n.__;

module.exports = function (location) {

  var $mount = null;
  var $elems = {};
  var handleNameChange;

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      location: location,
      __: __,
    }));

    $elems.display = $mount.find('.location-name-display');
    $elems.show = $mount.find('.location-rename-show');
    $elems.form = $mount.find('.location-rename-form');
    $elems.error = $mount.find('.location-rename-error');
    $elems.input = $mount.find('#location-rename-input');
    $elems.cancel = $mount.find('.location-rename-cancel');

    // Listen for events

    handleNameChange = function () {
      var newName = location.getName();
      var s = (newName === '' ? __('untitled') : newName);
      $elems.display.text(s);
    };
    location.on('location_name_changed', handleNameChange);

    // Rename form

    $elems.show.click(function (ev) {
      ev.preventDefault();

      if (ui.isHidden($elems.form)) {
        // Show
        ui.show($elems.form);
        // Remove possible error messages
        ui.hide($elems.error);
        // Prefill the form with the current name
        $elems.input.val(location.getName());
        // Focus to input field
        $elems.input.focus();
      } else {
        // Hide
        ui.hide($elems.form);
        // Remove possible error messages
        ui.hide($elems.error);
      }
    });

    $elems.cancel.click(function (ev) {
      ev.preventDefault();
      ui.hide($elems.form);
    });

    $elems.form.submit(function (ev) {
      ev.preventDefault();

      var newName = $elems.input.val().trim();
      var oldName = location.getName();

      if (newName === oldName) {
        // If name not changed, just close the form.
        ui.hide($elems.form);
        ui.hide($elems.error);
        return;
      }

      location.setName(newName, function (err) {
        ui.hide($elems.form);

        if (err) {
          console.error(err);
          ui.show($elems.error);
          return;
        }
      });
    });

  };

  this.unbind = function () {
    if ($mount) {
      location.off('location_name_changed', handleNameChange);
      ui.offAll($elems);
      $elems = {};
      $mount = null;
    }
  };
};
