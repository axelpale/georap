var template = require('./template.ejs');
var ui = require('tresdb-ui');
var bus = require('tresdb-bus');
var defaultSystemName = tresdb.config.coordinateSystems[0][0];

module.exports = function () {

  // For unbinding to prevent memory leaks.
  var $elems = {};
  var $mount = null;

  // Public methods

  this.bind = function ($mountArg) {
    $mount = $mountArg;
    $mount.html(template({}));

    $elems.form = $mount.find('.crosshair-form');
    var $lng = $mount.find('#crosshair-form-longitude');
    var $lat = $mount.find('#crosshair-form-latitude');
    var $error = $mount.find('.crosshair-form-error');

    // Form submit

    $elems.form.submit(function (ev) {
      ev.preventDefault();

      var lngRaw = $lng.val();
      var latRaw = $lat.val();

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

      var $lng = $mount.find('#crosshair-form-longitude');
      var $lat = $mount.find('#crosshair-form-latitude');

      $lng.val(lng);
      $lat.val(lat);
    }
  };

  this.unbind = function () {
    ui.offAll($elems);
    $mount = null;
  };
};
