var template = require('./Name.ejs');

module.exports = function (location) {

  this.bind = function ($mount) {

    $mount.html(template({
      location: location,
    }));

    location.on('name_changed', function () {
      var newName = location.getName();
      var s = (newName === '' ? 'Untitled' : newName);
      $('#tresdb-location-name').text(s);
    });

    // Rename form

    $('#tresdb-location-rename-show').click(function (ev) {
      ev.preventDefault();

      if ($('#tresdb-location-rename-form').hasClass('hidden')) {
        // Show
        $('#tresdb-location-rename-form').removeClass('hidden');
        // Remove possible error messages
        $('#tresdb-location-rename-error').addClass('hidden');
        // Prefill the form with the current name
        $('#tresdb-location-rename-input').val(location.getName());
        // Focus to input field
        $('#tresdb-location-rename-input').focus();
      } else {
        // Hide
        $('#tresdb-location-rename-form').addClass('hidden');
        // Remove possible error messages
        $('#tresdb-location-rename-error').addClass('hidden');
      }
    });

    $('#tresdb-location-rename-cancel').click(function (ev) {
      ev.preventDefault();
      $('#tresdb-location-rename-form').addClass('hidden');
    });

    $('#tresdb-location-rename-form').submit(function (ev) {
      ev.preventDefault();

      var newName = $('#tresdb-location-rename-input').val().trim();
      var oldName = location.getName();

      if (newName === oldName) {
        // If name not changed, just close the form.
        $('#tresdb-location-rename-form').addClass('hidden');
        $('#tresdb-location-rename-error').addClass('hidden');
        return;
      }

      location.setName(newName, function (err) {
        if (err) {
          console.error(err);
          $('#tresdb-location-rename-form').addClass('hidden');
          $('#tresdb-location-rename-error').removeClass('hidden');
          return;
        }

        $('#tresdb-location-rename-form').addClass('hidden');
      });
    });

  };

  this.unbind = function () {
    location.off('name_changed');
    $('#tresdb-location-rename-show').off();
    $('#tresdb-location-rename-cancel').off();
    $('#tresdb-location-rename-form').off();
  };
};
