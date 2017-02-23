var template = require('./Name.ejs');

module.exports = function (location) {

  var handleNameChange;

  this.bind = function ($mount) {

    $mount.html(template({
      location: location,
    }));

    var $display = $('#tresdb-location-name-display');
    var $show = $('#tresdb-location-rename-show');
    var $form = $('#tresdb-location-rename-form');
    var $error = $('#tresdb-location-rename-error');
    var $input = $('#tresdb-location-rename-input');
    var $cancel = $('#tresdb-location-rename-cancel');

    // Listen for events

    handleNameChange = function () {
      var newName = location.getName();
      var s = (newName === '' ? 'Untitled' : newName);
      $display.text(s);
    };
    location.on('location_name_changed', handleNameChange);

    // Rename form

    $show.click(function (ev) {
      ev.preventDefault();

      if ($form.hasClass('hidden')) {
        // Show
        $form.removeClass('hidden');
        // Remove possible error messages
        $error.addClass('hidden');
        // Prefill the form with the current name
        $input.val(location.getName());
        // Focus to input field
        $input.focus();
      } else {
        // Hide
        $form.addClass('hidden');
        // Remove possible error messages
        $error.addClass('hidden');
      }
    });

    $cancel.click(function (ev) {
      ev.preventDefault();
      $form.addClass('hidden');
    });

    $form.submit(function (ev) {
      ev.preventDefault();

      var newName = $input.val().trim();
      var oldName = location.getName();

      if (newName === oldName) {
        // If name not changed, just close the form.
        $form.addClass('hidden');
        $error.addClass('hidden');
        return;
      }

      location.setName(newName, function (err) {
        if (err) {
          console.error(err);
          $form.addClass('hidden');
          $error.removeClass('hidden');
          return;
        }

        $form.addClass('hidden');
      });
    });

  };

  this.unbind = function () {
    location.off('location_name_changed', handleNameChange);
    $('#tresdb-location-rename-show').off();
    $('#tresdb-location-rename-cancel').off();
    $('#tresdb-location-rename-form').off();
  };
};
