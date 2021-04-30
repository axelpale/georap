var template = require('./template.ejs');
var ui = require('tresdb-ui');
var geometryModel = require('georap-models').geometry;
var locationsStore = tresdb.stores.locations;

module.exports = function () {

  // For unbinding to prevent memory leaks.
  var $elems = {};

  // Geometries
  var _geoms;

  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({}));

    $elems.form = $mount.find('.crosshair-create');
    $elems.$name = $mount.find('.crosshair-create-name');
    $elems.$btn = $mount.find('button');
    var $error = $mount.find('.crosshair-create-error');

    // Emphasize create button only after there is text input
    $elems.$name.on('input', function () {
      var locName = $elems.$name.val().trim();

      var minLen = 2;
      var maxLen = 100;
      if (locName.length >= minLen && locName.length <= maxLen) {
        if ($elems.$btn.hasClass('btn-default')) {
          $elems.$btn.addClass('btn-primary').removeClass('btn-default');
        }
      } else if ($elems.$btn.hasClass('btn-primary')) {
        $elems.$btn.addClass('btn-default').removeClass('btn-primary');
      }
    });

    // Form submit

    $elems.form.submit(function (ev) {
      ev.preventDefault();

      if (!_geoms) {
        return;
      }

      var wgs84 = _geoms.WGS84;
      var lng = wgs84[0];
      var lat = wgs84[1];

      if (isNaN(lng) || isNaN(lat)) {
        ui.show($error);
        return;
      }

      var name = $elems.$name.val().trim();

      locationsStore.createWithName({
        geometry: geometryModel.latLngToPoint({
          lat: lat,
          lng: lng,
        }),
        name: name,
      }, function (err) {
        if (err) {
          console.error(err);
          return;
        }

        // TODO go to created location?
        // Or just add to map and a list below.
      });
    });
  };

  this.updateGeometry = function (geoms) {
    _geoms = geoms;
  };

  this.unbind = function () {
    ui.offAll($elems);
  };
};
