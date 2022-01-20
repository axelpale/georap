var template = require('./template.ejs');
var ui = require('georap-ui');
var __ = georap.i18n.__;

module.exports = function (location) {

  var handleNameChange;

  this.bind = function ($mount) {

    $mount.html(template({
      location: location,
      __: __,
    }));

    var $display = $('#location-name-display');
    var $show = $('#location-rename-show');
    var $form = $('#location-rename-form');
    var $error = $('#location-rename-error');
    var $input = $('#location-rename-input');
    var $cancel = $('#location-rename-cancel');

    // Listen for events

    handleNameChange = function () {
      var newName = location.getName();
      var s = (newName === '' ? __('untitled') : newName);
      $display.text(s);
    };
    location.on('location_name_changed', handleNameChange);

    // Rename form

    $show.click(function (ev) {
      ev.preventDefault();

      if (ui.isHidden($form)) {
        // Show
        ui.show($form);
        // Remove possible error messages
        ui.hide($error);
        // Prefill the form with the current name
        $input.val(location.getName());
        // Focus to input field
        $input.focus();
      } else {
        // Hide
        ui.hide($form);
        // Remove possible error messages
        ui.hide($error);
      }
    });

    $cancel.click(function (ev) {
      ev.preventDefault();
      ui.hide($form);
    });

    $form.submit(function (ev) {
      ev.preventDefault();

      var newName = $input.val().trim();
      var oldName = location.getName();

      if (newName === oldName) {
        // If name not changed, just close the form.
        ui.hide($form);
        ui.hide($error);
        return;
      }

      location.setName(newName, function (err) {
        ui.hide($form);

        if (err) {
          console.error(err);
          ui.show($error);
          return;
        }
      });
    });

  };

  this.unbind = function () {
    location.off('location_name_changed', handleNameChange);
    $('#location-rename-show').off();
    $('#location-rename-cancel').off();
    $('#location-rename-form').off();
  };
};
