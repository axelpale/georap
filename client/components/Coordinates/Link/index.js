// Link to current coordinate
//
var template = require('./template.ejs');
var queryString = require('qs');
var urls = require('georap-urls-client');
var mapStateStore = georap.stores.mapstate;
var defaultSystemName = georap.config.coordinateSystems[0][0];
var __ = georap.i18n.__;
var PREC = 6; // decimals in url coords

module.exports = function () {
  // Init
  var $mount = null;

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    var mapState = mapStateStore.get();
    var q = {
      lat: mapState.lat.toFixed(PREC),
      lng: mapState.lng.toFixed(PREC),
      zoom: mapState.zoom,
    };

    $mount.html(template({
      url: urls.baseUrl() + '/?' + queryString.stringify(q),
      __: __,
    }));
  };

  this.updateGeometry = function (geoms) {
    if ($mount) {
      var defaultCoords = geoms[defaultSystemName];

      var q = {
        lat: defaultCoords[1].toFixed(PREC),
        lng: defaultCoords[0].toFixed(PREC),
        zoom: mapStateStore.get().zoom,
      };

      $mount.html(template({
        url: urls.baseUrl() + '/?' + queryString.stringify(q),
        __: __,
      }));
    }
  };

  this.unbind = function () {
    $mount = null;
  };
};
