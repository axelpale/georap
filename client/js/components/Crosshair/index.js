// Component to filter map markers.

var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var template = require('./template.ejs');
var GeomView = require('./Geom');
var mapstateStore = tresdb.stores.mapstate;

module.exports = function () {
  // Parameters
  //

  // Init
  var self = this;
  emitter(self); // Every card must be emitter to be able to detect close
  var children = {};

  var updateTemplate = function () {
    // TODO Rebind geom
  };

  // Public methods

  this.bind = function ($mount) {
    var mapstate = mapstateStore.get();

    $mount.html(template({
      // For any-type button.
      geom: mapstate.geom, // TODO latitude longitude
    }));

    children.geom = new GeomView();
    children.geom.bind($mount.find('.crosshair-geom-container'));

    // Listen changes on position.
    mapstateStore.on('updated', updateTemplate);
  };

  this.unbind = function () {
    mapstateStore.off('updated', updateTemplate);
    ui.unbindAll(children);
  };
};
