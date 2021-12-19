
var template = require('./template.ejs');
var emitter = require('component-emitter');
var ui = require('georap-ui');
var mapStateStore = georap.stores.mapstate;

var NAME = 0;
var COORD_SYS = 2;
var BOUNDS = 3;

// Services that can be referenced by a link.
// Collect the templates here for simpler code.
// Some services require non-WGS84 coordinates.
// Location provides those via getAltGeom method.
var exportServices = georap.config.exportServices.map(function (serv) {
  var servName = serv[NAME];
  var servCoordSys = serv[COORD_SYS];
  var servLatLngBounds = serv[BOUNDS];

  return {
    name: servName,
    system: servCoordSys,
    template: georap.templates[servName],
    bounds: servLatLngBounds,
  };
});


module.exports = function (location) {
  // Parameters:
  //   location
  //     a location object
  //

  var self = this;
  emitter(self);

  var listeners = {};

  self.bind = function ($mount) {

    // Select services available for this location
    var lat = location.geom.coordinates[1];
    var lng = location.geom.coordinates[0];
    var availableServices = exportServices.filter(function (es) {
      // Select service if current location in any of its bounds.
      if (es.bounds) {
        var i, bounds;
        for (i = 0; i < es.bounds.length; i += 1) {
          bounds = es.bounds[i];
          if (lng <= bounds.east && bounds.west <= lng) {
            if (lat <= bounds.north && bounds.south <= lat) {
              // Is inside
              return true;
            }
          }
        }
        return false;
      }
      // Bounds not defined. Always available.
      return true;
    });

    // Compute service templates into URLs
    var mapstate = mapStateStore.get();
    var exportServiceUrls = availableServices.map(function (es) {
      var altCoords = location.altGeom[es.system];
      var url = es.template({
        name: location.name,
        zoom: mapstate.zoom,
        longitude: altCoords[0],
        latitude: altCoords[1],
      });

      return {
        name: es.name,
        url: url,
      };
    });

    // Render
    $mount.html(template({
      services: exportServiceUrls,
      __: georap.i18n.__,
    }));

    listeners.cancel = $mount.find('.location-viewon-cancel');
    listeners.cancel.click(function () {
      self.emit('exit');
    });
  };

  self.unbind = function () {
    ui.offAll(listeners);
  };

};
