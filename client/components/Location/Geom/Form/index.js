var template = require('./template.ejs');
var emitter = require('component-emitter');
var Picker = require('./Picker');
var ui = require('georap-ui');
var locations = georap.stores.locations;

module.exports = function (locationId, geom) {
  // Parameters
  //   locationId
  //   geom
  //     GeoJSON { type: 'Point', coordinates: [lng, lat] }
  //

  var $mount = null;
  var children = {};
  var $elems = {};
  var self = this;
  emitter(self);

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;
    var lng = geom.coordinates[0];
    var lat = geom.coordinates[1];

    // Render
    $mount.html(template({
      longitude: lng,
      latitude: lat,
      __: georap.i18n.__,
    }));

    $elems.progress = $mount.find('#location-geom-progress');
    $elems.error = $mount.find('#location-geom-error');
    $elems.lng = $mount.find('#location-geom-longitude');
    $elems.lat = $mount.find('#location-geom-latitude');

    // Load map
    $elems.map = $mount.find('#location-geom-map');
    children.picker = new Picker(lng, lat);
    children.picker.bind($elems.map);

    children.picker.on('center_changed', function (center) {
      $elems.lng.val(center.lng);
      $elems.lat.val(center.lat);
    });

    $elems.cancel = $mount.find('#location-geom-cancel');
    $elems.cancel.click(function (ev) {
      ev.preventDefault();
      self.emit('cancel');
    });

    $elems.form = $mount.find('#location-geom-form');
    $elems.form.submit(function (ev) {
      ev.preventDefault();

      var lngRaw = $elems.lng.val();
      var latRaw = $elems.lat.val();

      var newLng = parseFloat(lngRaw);
      var newLat = parseFloat(latRaw);

      // Hide form and show progress bar
      ui.hide($elems.form);
      ui.show($elems.progress);

      locations.setGeom(locationId, newLng, newLat, function (err) {
        // Hide progress bar
        ui.hide($elems.progress);

        if (err) {
          console.error(err); // TODO render error message
          ui.show($elems.error);
          return;
        }

        // Close the form via Opener and let
        // location_geom_changed event do its job.
        self.emit('finish');
      });
    });
  };

  this.update = function (newGeom) {
    // NOTE If form is bound, do not update rendered form values.
    // This way we avoid an external change messing with form input.
    // TODO notify form user that coordinates might have been changed.
    // Update only the input values for next bind.
    geom = newGeom;
  };

  this.unbind = function () {
    if ($mount) {
      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
      $mount.empty();
      $mount = null;
    }
  };
};
