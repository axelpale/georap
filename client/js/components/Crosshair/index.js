// Component to filter map markers.
//
var ui = require('tresdb-ui');
var emitter = require('component-emitter');
var template = require('./template.ejs');
var TitleView = require('./Title');
var FormView = require('./Form');
var ViewOnView = require('./ViewOn');
var mapStateStore = tresdb.stores.mapstate;
var geometryApi = tresdb.stores.geometry;

module.exports = function () {
  // Parameters
  //

  // Init
  var self = this;
  emitter(self); // Every card must be an emitter to be able to detect close
  var children = {};
  var listeners = {};

  // Public methods

  this.bind = function ($mount) {
    $mount.html(template({}));

    children.title = new TitleView();
    children.title.bind($mount.find('.crosshair-title-container'));

    children.form = new FormView();
    children.form.bind($mount.find('.crosshair-form-container'));

    children.viewon = new ViewOnView();
    children.viewon.bind($mount.find('.crosshair-viewon-container'));

    listeners.updated = function (mapState) {
      var geom = {
        type: 'Point',
        coordinates: [mapState.lng, mapState.lat],
      };
      geometryApi.getInEverySystem(geom, function (err, geoms) {
        if (err) {
          return console.error(err); // TODO
        }
        console.log('geoms', geoms);
        // children.title.updateCoords(geoms);
        // children.form.updateCoords(geoms);
        // children.viewon.updateCoords(geoms);
      });
    };

    ui.onBy(mapStateStore, listeners);
  };

  this.unbind = function () {
    ui.unbindAll(children);
    ui.offBy(mapStateStore, listeners);
  };
};
