/* eslint-disable max-statements */
var geostamp = require('./geostamp');
var template = require('./template.ejs');
var ui = require('tresdb-ui');
var mapStateStore = tresdb.stores.mapstate;

var geomToHtml = function (geom) {
  // coordinates in each registered coordinate system.

  // Coordinate systems and their templates
  var systemName = tresdb.config.coordinateSystems[0][0];
  var systemTemplate = tresdb.templates[systemName];

  var coords = geom.coordinates;

  var tmplParams = {
    lat: coords[1],
    lng: coords[0],
    absLat: Math.abs(coords[1]),
    absLng: Math.abs(coords[0]),
    getLatDir: geostamp.latitudeDirection,
    getLngDir: geostamp.longitudeDirection,
    getD: geostamp.getDecimal,
    getDM: geostamp.getDM,
    getDMS: geostamp.getDMS,
  };

  return systemTemplate(tmplParams);
};

var mapStateToGeom = function (mapState) {
  return {
    type: 'Point',
    coordinates: [mapState.lng, mapState.lat],
  };
};

module.exports = function () {

  // For unbinding to prevent memory leaks.
  var listeners = {};

  // Public methods

  this.bind = function ($mount) {

    var geom = mapStateToGeom(mapStateStore.get());

    // Render
    $mount.html(template({
      geomHtml: geomToHtml(geom),
    }));

    // Preparation for binds

    var $geostamp = $('#crosshair-coords-geostamp');
    var $lng = $('#crosshair-coords-longitude');
    var $lat = $('#crosshair-coords-latitude');

    listeners.$form = $('#crosshair-coords-form');

    var prefill = function (g) {
      // Parameters
      //   g: geom
      var lng = g.coordinates[0];
      var lat = g.coordinates[1];

      $lng.val(lng);
      $lat.val(lat);
    };
    prefill(geom);

    listeners.$form.submit(function (ev) {
      ev.preventDefault();

      var lngRaw = $lng.val();
      var latRaw = $lat.val();

      var lng = parseFloat(lngRaw);
      var lat = parseFloat(latRaw);

      console.log(lng, lat);
      // TODO move map on edit
      // map.setGeom(lng, lat, function (err) {
      //   // Hide progress bar
      //   ui.hide($progress);
      //
      //   if (err) {
      //     ui.show($error);
      //     return;
      //   }
      //   closeForm();
      // });
    });

    // Event handling


    listeners.change = (function () {
      var geomChangedHandler = function () {
        // Update coords on geom change.
        // TODO Get coords in each coord system.
        // WGS84
        var g = mapStateToGeom(mapStateStore.get());
        var coordsHtml = geomToHtml(g);
        $geostamp.html(coordsHtml);
        // Reset form fields
        prefill(g);
      };

      mapStateStore.on('updated', geomChangedHandler);

      return {
        off: function () {
          mapStateStore.off('updated', geomChangedHandler);
        },
      };
    }());
  };

  this.unbind = function () {
    ui.offAll(listeners);
    listeners = {};
  };
};
