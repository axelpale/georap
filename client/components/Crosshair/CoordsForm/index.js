// Enable user to write coordinates to navigate on the map.
//
var template = require('./template.ejs');
var ui = require('georap-ui');
// var bus = require('georap-bus');
var geometryStore = tresdb.stores.geometry;
var coordinateSystems = tresdb.config.coordinateSystems;
var defaultSystemName = coordinateSystems[0][0];

module.exports = function () {

  // For unbinding to prevent memory leaks.
  var $elems = {};
  var $mount = null;

  // Public methods

  this.bind = function ($mountArg) {
    $mount = $mountArg;
    $mount.html(template({
      systems: coordinateSystems,
      defaultSystemName: defaultSystemName,
    }));

    $elems.form = $mount.find('.coordsform');
    $elems.systemSelector = $mount.find('select.form-control');
    $elems.coordInput = $mount.find('input.coordsform-input');
    $elems.resetBtn = $mount.find('button.coordform-reset');
    $elems.goBtn = $mount.find('button.coordsform-go');
    $elems.example = $mount.find('.coordsform-example');
    $elems.error = $mount.find('.coordsform-error');

    // Render system specific form when system selection changes.
    var handleSystemChange = function () {
      var selectedSystem = $elems.systemSelector.val();
      console.log('selectedSystem', selectedSystem);
    };
    $elems.systemSelector.on('change', handleSystemChange);

    // Make go button stand out during custom coordinates.
    // Return it default during geometry update.
    var handleChange = function () {
      if ($elems.goBtn.hasClass('btn-default')) {
        $elems.goBtn.addClass('btn-primary').removeClass('btn-default');
      }
    };
    $elems.coordInput.on('input', handleChange);

    // Form submit
    $elems.form.submit(function (ev) {
      ev.preventDefault();

      var selectedSystem = $elems.systemSelector.val();
      var coordRaw = $elems.coordInput.val().trim();

      // Call backend
      geometryStore.parseCoordinates({
        system: selectedSystem,
        text: coordRaw,
      }, function (err, coords) {
        if (err) {
          $elems.error.html(err.message);
          ui.show($elems.error);
          return;
        }

        console.log(coords);

        // bus.emit('crosshair_form_submit', {
        //   latLng: latLng,
        // });
      });
    });
  };

  this.unbind = function () {
    ui.offAll($elems);
    $mount = null;
  };
};
