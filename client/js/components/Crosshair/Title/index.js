// Component to filter map markers.

var ui = require('tresdb-ui');
var geostamp = require('geostamp');
var template = require('./template.ejs');
var mapStateStore = tresdb.stores.mapstate;

module.exports = function () {
  // Init
  var listeners = {};

  var defaultSystemName = tresdb.config.coordinateSystems[0][0];
  var coordTemplate = tresdb.templates[defaultSystemName];

  // Public methods

  this.bind = function ($mount) {
    var mapState = mapStateStore.get();

    $mount.html(template({
      geostamp: geostamp.html(coordTemplate, mapState.lat, mapState.lng),
    }));

    var $geostamp = $mount.find('.crosshair-geostamp');

    // Listen changes on position.
    listeners.updated = function (newState) {
      var h = geostamp.html(coordTemplate, newState.lat, newState.lng);
      $geostamp.html(h);
    };

    ui.onBy(mapStateStore, listeners);
  };

  this.unbind = function () {
    ui.offBy(mapStateStore, listeners);
  };
};
