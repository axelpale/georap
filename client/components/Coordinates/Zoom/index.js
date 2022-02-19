// Display maps zoom level
//
var template = require('./template.ejs');
var ui = require('georap-ui');
var mapStateStore = georap.stores.mapstate;

module.exports = function () {
  // Init
  var $mount = null;
  var listeners = null;

  // Public methods

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    var zoom = mapStateStore.get().zoom;

    $mount.html(template({
      zoom: zoom,
      __: georap.i18n.__,
    }));

    listeners = {
      'updated': function (state) {
        $mount.find('.zoom-level').html(state.zoom);
      },
    };

    ui.onBy(mapStateStore, listeners);
  };

  this.unbind = function () {
    $mount = null;
    ui.offBy(mapStateStore, listeners);
  };
};
