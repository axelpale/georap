var tresdb = window.tresdb;
var ui = require('../../lib/ui');
var geostamp = require('./geostamp');
var template = require('./template.ejs');

// Coordinate systems and their templates
var systemNames = tresdb.config.coordinateSystems.map(function (sys) {
  return sys[0];
});


module.exports = function (location) {

  // Public methods

  this.bind = function ($mount) {

    // Preparation for rendering

    // Render coordinates in each registered coordinate system.
    var allCoords = systemNames.map(function (sysName) {
      var coords = location.getAltGeom()[sysName];

      var tmplParams = {
        lat: coords[1],
        lng: coords[0],
        absLat: Math.abs(coords[1]),
        absLng: Math.abs(coords[0]),
        getLatDir: geostamp.latitudeDirection,
        getLngDir: geostamp.longitudeDirection,
        getD: geostamp.getDecimal,
        getDM: geostamp.getDM,
        getDMS: geostamp.getDMS,
      };

      var systemHtml = tresdb.templates[sysName](tmplParams);

      return {
        name: sysName,
        html: systemHtml,
      };
    });

    // Render

    $mount.html(template({
      location: location,
      allCoords: allCoords,
    }));

    // Preparation for binds

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
      ui.show($container);
      ui.show($form);
      // Hide all possible error messages
      ui.hide($error);
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

    (function defineMore() {
      var $more = $('#tresdb-location-coords-more');
      var $moreopen = $('#tresdb-location-coords-more-open');
      var $moreclose = $('#tresdb-location-coords-more-close');

      $moreopen.click(function (ev) {
        ev.preventDefault();
        ui.hide($moreopen);
        ui.show($moreclose);
        ui.show($more);
      });

      $moreclose.click(function (ev) {
        ev.preventDefault();
        ui.hide($moreclose);
        ui.show($moreopen);
        ui.hide($more);
      });

    }());

    // Event handling

    location.on('location_geom_changed', function () {
      var geostampHtml = geostamp(location.getGeom(), { precision: 5 });
      $geostamp.html(geostampHtml);
    });

  };

  this.unbind = function () {
    var $edit = $('#tresdb-location-coords-edit');
    var $form = $('#tresdb-location-coords-form');
    var $cancel = $('#tresdb-location-coords-cancel');
    var $moreopen = $('#tresdb-location-coords-more-open');

    $edit.off();
    $form.off();
    $cancel.off();
    $moreopen.off();

  };
};
