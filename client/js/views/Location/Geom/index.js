
var geostamp = require('./geostamp');
var template = require('./template.ejs');

module.exports = function (location) {

  // Public methods

  this.bind = function ($mount) {

    $mount.html(template({
      location: location,
      geostamp: geostamp,
    }));

    // Preparation

    var $edit = $('#tresdb-location-coords-edit');
    var $container = $('#tresdb-location-coords-container');
    var $progress = $('#tresdb-location-coords-progress');
    var $geostamp = $('#tresdb-location-coords-geostamp');
    var $form = $('#tresdb-location-coords-form');
    var $cancel = $('#tresdb-location-coords-cancel');
    var $error = $('#tresdb-location-coords-error');
    var $lng = $('#tresdb-location-coords-longitude');
    var $lat = $('#tresdb-location-coords-latitude');

    var isFormOpen = function () {
      var isHidden = $container.hasClass('hidden');
      return !isHidden;
    };

    var openForm = function () {
      $container.removeClass('hidden');
      $form.removeClass('hidden');
      // Hide all possible error messages
      $error.addClass('hidden');
    };

    var closeForm = function () {
      $container.addClass('hidden');
      // Hide all possible error messages
      $error.addClass('hidden');
    };

    var prefill = function () {
      var lng = location.getLongitude();
      var lat = location.getLatitude();

      $lng.val(lng);
      $lat.val(lat);
    };

    // Binds

    $edit.click(function (ev) {
      ev.preventDefault();

      if (isFormOpen()) {
        closeForm();
      } else {
        openForm();
        prefill();
      }
    });

    $cancel.click(function (ev) {
      ev.preventDefault();
      closeForm();
    });

    $form.submit(function (ev) {
      ev.preventDefault();

      var lngRaw = $lng.val();
      var latRaw = $lat.val();

      var lng = parseFloat(lngRaw);
      var lat = parseFloat(latRaw);



      // Hide form and show progress bar
      $form.addClass('hidden');
      $progress.removeClass('hidden');

      location.setGeom(lng, lat, function (err) {
        // Hide progress bar
        $progress.addClass('hidden');

        if (err) {
          $error.removeClass('hidden');
          return;
        }
        closeForm();
      });
    });

    location.on('geom_changed', function () {
      var geostampHtml = geostamp(location.getGeom(), { precision: 5 });
      $geostamp.html(geostampHtml);
    });

  };

  this.unbind = function () {
    var $edit = $('#tresdb-location-coords-edit');
    var $form = $('#tresdb-location-coords-form');
    var $cancel = $('#tresdb-location-coords-cancel');

    $edit.off();
    $form.off();
    $cancel.off();

  };
};
