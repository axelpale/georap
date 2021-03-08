var template = require('./template.ejs');
var ui = require('tresdb-ui');
var mapStateStore = tresdb.stores.mapstate;

module.exports = function () {

  // For unbinding to prevent memory leaks.
  var $elems = {};
  var listeners = {};

  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({}));

    $elems.form = $mount.find('.crosshair-form');
    var $lng = $('#crosshair-coords-longitude');
    var $lat = $('#crosshair-coords-latitude');
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

      mapStateStore.update({
        lat: lat,
        lng: lng,
      });
    });

    // Form reset and reactivity

    var fillForm = function (mapState) {
      $lng.val(mapState.lng);
      $lat.val(mapState.lat);
    };
    fillForm(mapStateStore.get());

    listeners.updated = function (mapState) {
      fillForm(mapState);
    };

    ui.onBy(mapStateStore, listeners);
  };

  this.unbind = function () {
    ui.offAll($elems);
    ui.offBy(mapStateStore, listeners);
  };
};
