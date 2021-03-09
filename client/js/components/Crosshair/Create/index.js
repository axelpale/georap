var template = require('./template.ejs');
var ui = require('tresdb-ui');
var geometryModel = require('tresdb-models').geometry;
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
    var $name = $mount.find('.crosshair-create-name');
    var $error = $mount.find('.crosshair-create-error');

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

      var name = $name.val().trim();

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
