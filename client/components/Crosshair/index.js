// Component to filter map markers.
//
var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var template = require('./template.ejs');
var TitleView = require('./Title');
var ZoomView = require('./Zoom');
var CoordsView = require('./Coords');
var FormView = require('./Form');
var ViewOnView = require('./ViewOn');
var CreateView = require('./Create');
var geometryApi = tresdb.stores.geometry;
var geometryModel = require('georap-models').geometry;
var bus = require('georap-bus');
var throttle = require('georap-throttle');

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

    children.zoom = new ZoomView();
    children.zoom.bind($mount.find('.crosshair-zoom-container'));

    children.coords = new CoordsView();
    children.coords.bind($mount.find('.crosshair-coords-container'));

    children.form = new FormView();
    children.form.bind($mount.find('.crosshair-form-container'));

    children.viewon = new ViewOnView();
    children.viewon.bind($mount.find('.crosshair-viewon-container'));

    children.create = new CreateView();
    children.create.bind($mount.find('.crosshair-create-container'));

    var THROTTLE_DURATION = 2000; // ms
    routes.crosshair = bus.on('crosshair_marker_moved', throttle(
      function (latLng, callback) {
        var geom = geometryModel.latLngToPoint(latLng);
        geometryApi.getInEverySystem(geom, function (err, geoms) {
          if (err) {
            return console.error(err); // TODO
          }
          // Ensure view is still bound
          if (children.title) {
            children.title.updateGeometry(geoms);
            children.coords.updateGeometry(geoms);
            children.form.updateGeometry(geoms);
            children.viewon.updateGeometry(geoms);
            children.create.updateGeometry(geoms);
          }
          return callback();
        });
      },
      THROTTLE_DURATION
    ));

    // Enable crosshair on the map after the view has rendered
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
