// Component to filter map markers.
//
var ui = require('georap-ui');
var emitter = require('component-emitter');
var template = require('./template.ejs');
var TitleView = require('./Title');
var LinkView = require('./Link');
var ZoomView = require('./Zoom');
var CoordsView = require('./CoordsView');
var CoordsFormView = require('./CoordsForm');
var ViewOnView = require('./ViewOn');
var CreateView = require('./Create');
var geometryApi = georap.stores.geometry;
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

    children.link = new LinkView();
    children.link.bind($mount.find('.crosshair-link-container'));

    children.zoom = new ZoomView();
    children.zoom.bind($mount.find('.crosshair-zoom-container'));

    children.coords = new CoordsView();
    children.coords.bind($mount.find('.crosshair-coords-container'));

    children.coordsform = new CoordsFormView();
    children.coordsform.bind($mount.find('.crosshair-coordsform-container'));

    children.viewon = new ViewOnView();
    children.viewon.bind($mount.find('.crosshair-viewon-container'));

    children.create = new CreateView();
    children.create.bind($mount.find('.crosshair-create-container'));

    var THROTTLE_DURATION = 2000; // ms
    routes.crosshair = bus.on('crosshair_marker_moved', throttle(
      function (latLng, callback) {
        var geom = geometryModel.latLngToPoint(latLng);
        geometryApi.getInEverySystem(geom, function (err, geoms) {
          // Params:
          //   err
          //   geoms is { <systemName>: [x, y], ... }
          //
          if (err) {
            return console.error(err); // TODO
          }
          // Ensure view is still bound
          if (children.title) {
            children.title.updateGeometry(geoms);
            children.link.updateGeometry(geoms);
            children.coords.updateGeometry(geoms);
            children.viewon.updateGeometry(geoms);
            children.create.updateGeometry(geoms);
            children.coordsform.updateGeometry(geoms);
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
