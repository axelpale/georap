// Component to filter map markers.
//
var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var template = require('./template.ejs');
var TitleView = require('./Title');
var FormView = require('./Form');
var ViewOnView = require('./ViewOn');
var CreateView = require('./Create');
var geometryApi = tresdb.stores.geometry;
var geometryModel = require('tresdb-models').geometry;
var bus = require('tresdb-bus');

module.exports = function () {
  // Parameters
  //

  // Init
  var self = this;
  emitter(self); // Every card must be an emitter to be able to detect close
  var children = {};
  var routes = {};

  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({}));

    children.title = new TitleView();
    children.title.bind($mount.find('.crosshair-title-container'));

    children.form = new FormView();
    children.form.bind($mount.find('.crosshair-form-container'));

    children.viewon = new ViewOnView();
    children.viewon.bind($mount.find('.crosshair-viewon-container'));

    children.create = new CreateView();
    children.create.bind($mount.find('.crosshair-create-container'));

    routes.crosshair = bus.on('crosshair_marker_moved', function (latLng) {
      var geom = geometryModel.latLngToPoint(latLng);
      geometryApi.getInEverySystem(geom, function (err, geoms) {
        if (err) {
          return console.error(err); // TODO
        }
        console.log('geoms', geoms);
        children.create.updateGeometry(geoms);
        children.title.updateGeometry(geoms);
        // children.form.updateCoords(geoms);
        // children.viewon.updateCoords(geoms);
      });
    });

    // Enable crosshair after the view has rendered
    // Rendering is necessary to get the card width to place the crosshair.
    setTimeout(function () {
      bus.emit('crosshair_view_enter');
    }, 0);
  };

  this.unbind = function () {
    ui.unbindAll(children);
    children = {};

    bus.off(routes.crosshair);
    routes = {};

    // Disable crosshair
    bus.emit('crosshair_view_exit');
  };
};
