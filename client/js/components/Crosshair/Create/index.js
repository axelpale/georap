var template = require('./template.ejs');
var ui = require('tresdb-ui');
var mapStateStore = tresdb.stores.mapstate;
var locationsStore = tresdb.stores.locations;

module.exports = function () {

  // For unbinding to prevent memory leaks.
  var $elems = {};

  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({}));

    $elems.form = $mount.find('.crosshair-create');
    var $name = $mount.find('.crosshair-create-name');
    var $error = $mount.find('.crosshair-create-error');

    // Form submit

    $elems.form.submit(function (ev) {
      ev.preventDefault();

      var mapState = mapStateStore.get();

      var lng = mapState.lng;
      var lat = mapState.lat;

      if (isNaN(lng) || isNaN(lat)) {
        ui.show($error);
        return;
      }

      var name = $name.val().trim();

      locationsStore.createWithName({
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        name: name,
      }, function (err) {
        if (err) {
          console.error();
          return;
        }

        // TODO go to created location?
        // Or just add to map and a list below.
      });
    });
  };

  this.unbind = function () {
    ui.offAll($elems);
  };
};
