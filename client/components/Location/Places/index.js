
var template = require('./template.ejs');
var displayTemplate = require('./display.ejs');
var __ = georap.i18n.__;

module.exports = function (location) {

  // Public methods

  this.bind = function ($mount) {

    $mount.html(template({
      displayTemplate: displayTemplate,
      places: location.getPlaces(),
      __: __,
    }));

    // Preparation

    var $display = $mount.find('.location-places-display');

    location.on('location_geom_changed', function () {
      $display.html(displayTemplate({
        places: location.getPlaces(),
        __: __,
      }));
    });

  };

  this.unbind = function () {
    // noop
  };
};
