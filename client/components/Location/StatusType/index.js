var urls = require('georap-urls-client');
var ui = require('georap-ui');
var components = require('georap-components');
var StatusTypeForm = require('./Form');
var template = require('./template.ejs');
var statusTypeTemplate = require('./statusType.ejs');
var locationTypes = georap.config.locationTypes;
var ableOwn = georap.stores.account.ableOwn;
var __ = georap.i18n.__;

module.exports = function (location) {

  // Setup
  var $mount = null;
  var self = this;
  var children = {};
  var $elems = {};

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    var loc = location.getRaw();
    var ableEdit = ableOwn(loc, 'locations-update');

    $mount.html(template({
      // The current status and type
      statusTypeHtml: statusTypeTemplate({
        currentStatus: location.getStatus(),
        currentType: location.getType(),
        toSymbolUrl: urls.locationTypeToSymbolUrl,
        defaultType: locationTypes[0],
        __: __,
      }),
      ableEdit: ableEdit,
      __: __,
    }));

    if (ableEdit) {
      var form = new StatusTypeForm(location);
      children.opener = new components.Opener(form);
      children.opener.bind({
        $container: $mount.find('.location-statustype-form-container'),
        $button: $mount.find('.location-statustype-form-show'),
      });
    }

    // Update if status or type is changed externally.
    location.on('location_status_changed', function () {
      $mount.empty();
      var $remount = $mount;
      self.unbind(); // without unbind, exponential growth in num of calls
      self.bind($remount);
    });
    location.on('location_type_changed', function () {
      $mount.empty();
      var $remount = $mount;
      self.unbind(); // without unbind, exponential growth in num of calls
      self.bind($remount);
    });
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;

      location.off('location_status_changed');
      location.off('location_type_changed');

      ui.unbindAll(children);
      children = {};
      ui.offAll($elems);
      $elems = {};
    }
  };
};
