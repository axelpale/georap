// Enable user to write coordinates to navigate on the map.
//
var template = require('./template.ejs');
var ui = require('georap-ui');
var bus = require('georap-bus');
var coordinateSystems = tresdb.config.coordinateSystems;
var defaultSystemName = coordinateSystems[0][0];

// Coordinate decimals
var PRECISION = 6; //

module.exports = function () {

  // For unbinding to prevent memory leaks.
  var $elems = {};
  var $mount = null;

  // Public methods

  this.bind = function ($mountArg) {
    $mount = $mountArg;
    $mount.html(template({}));

    $elems.form = $mount.find('.coordsform');
    $elems.$lng = $mount.find('#coordsform-longitude');
    $elems.$lat = $mount.find('#coordsform-latitude');
    $elems.$goBtn = $mount.find('button');
    var $error = $mount.find('.coordsform-error');

    // Make go button stand out during custom coordinates.
    // Return it default during geometry update.
    var handleChange = function () {
      if ($elems.$goBtn.hasClass('btn-default')) {
        $elems.$goBtn.addClass('btn-primary').removeClass('btn-default');
      }
    };
    $elems.$lng.on('input', handleChange);
    $elems.$lat.on('input', handleChange);

    // Form submit

    $elems.form.submit(function (ev) {
      ev.preventDefault();

      var lngRaw = $elems.$lng.val();
      var latRaw = $elems.$lat.val();

      var lng = parseFloat(lngRaw);
      var lat = parseFloat(latRaw);

      if (isNaN(lng) || isNaN(lat)) {
        ui.show($error);
        return;
      }

      bus.emit('crosshair_form_submit', {
        latLng: {
          lat: lat,
          lng: lng,
        },
      });
    });
  };

  this.updateGeometry = function (geoms) {
    if ($mount) {
      var defaultCoords = geoms[defaultSystemName];
      var lat = defaultCoords[1];
      var lng = defaultCoords[0];

      $elems.$lng.val(lng.toFixed(PRECISION));
      $elems.$lat.val(lat.toFixed(PRECISION));

      // Make go button default style if not already.
      if ($elems.$goBtn.hasClass('btn-primary')) {
        $elems.$goBtn.addClass('btn-default').removeClass('btn-primary');
      }
    }
  };

  this.unbind = function () {
    ui.offAll($elems);
    $mount = null;
  };
};
