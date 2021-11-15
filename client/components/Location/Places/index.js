
var template = require('./template.ejs');
var displayTemplate = require('./display.ejs');

module.exports = function (location) {

  // Public methods

  this.bind = function ($mount) {

    $mount.html(template({
      displayTemplate: displayTemplate,
      places: location.getPlaces(),
    }));

    // Preparation

    var $display = $('#georap-location-places-display');

    location.on('location_geom_changed', function () {
      $display.html(displayTemplate({
        places: location.getPlaces(),
      }));
    });

  };

  this.unbind = function () {
    // noop
  };
};
