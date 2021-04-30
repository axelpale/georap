// Tools
var urls = require('georap-urls-client');
var ui = require('tresdb-ui');
// Templates
var template = require('./template.ejs');
var statusTypeTemplate = require('./statusType.ejs');
var statusFormListTemplate = require('./statusFormList.ejs');
var typeFormListTemplate = require('./typeFormList.ejs');
// Config
var locationStatuses = tresdb.config.locationStatuses;
var locationTypes = tresdb.config.locationTypes;

module.exports = function (location) {

  // Setup
  var $mount = null;
  var self = this;
  var $elems = {};

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      // The current status and type
      statusTypeHtml: statusTypeTemplate({
        currentStatus: location.getStatus(),
        currentType: location.getType(),
        toSymbolUrl: urls.locationTypeToSymbolUrl,
        defaultType: locationTypes[0],
        cap: ui.cap,
      }),
      // List of available statuses
      statusFormListHtml: statusFormListTemplate({
        locationStatuses: locationStatuses,
        currentStatus: location.getStatus(),
        cap: ui.cap,
      }),
      // List of available types
      typeFormListHtml: typeFormListTemplate({
        locationTypes: locationTypes,
        currentType: location.getType(),
        toSymbolUrl: urls.locationTypeToSymbolUrl,
      }),
    }));

    $elems.show = $mount.find('.location-statustype-form-show');
    $elems.form = $mount.find('.location-statustype-form');
    $elems.cancel = $mount.find('.location-statustype-form-cancel');
    $elems.progress = $mount.find('.location-statustype-form-progress');
    $elems.error = $mount.find('.location-statustype-form-error');
    $elems.statusList = $mount.find('.location-status-list');
    $elems.typeList = $mount.find('.location-type-list');

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

    // Form toggle
    $elems.show.click(function (ev) {
      ev.preventDefault();

      // Remove possible previous error messages
      ui.hide($elems.error);

      if (ui.isHidden($elems.form)) {
        ui.show($elems.form);
      } else {
        ui.hide($elems.form);
      }
    });

    // Form cancel
    $elems.cancel.click(function (ev) {
      ev.preventDefault();
      ui.hide($elems.form);
    });

    var submitStatus = function (newStatus) {
      ui.show($elems.progress);
      ui.hide($elems.form);

      location.setStatus(newStatus, function (err) {
        ui.hide($elems.progress);

        if (err) {
          console.error(err);
          // Show error message
          ui.show($elems.error);
          return;
        }
        // Everything ok
      });
    };

    var submitType = function (newType) {
      ui.show($elems.progress);
      ui.hide($elems.form);

      location.setType(newType, function (err) {
        ui.hide($elems.progress);

        if (err) {
          console.error(err);
          ui.show($elems.error);
          return;
        }
        // Everything ok
      });
    };

    // Click on a status button
    $elems.statusList.click(function (ev) {
      ev.preventDefault(); // Avoid page reload.
      var btnValue = ev.target.dataset.status;
      if (typeof btnValue === 'string' && btnValue.length > 0) {
        submitStatus(btnValue);
      }
    });

    // Click on a type button
    $elems.typeList.click(function (ev) {
      ev.preventDefault(); // Avoid page reload.
      var btnValue = ev.target.dataset.type;
      if (typeof btnValue === 'string' && btnValue.length > 0) {
        submitType(btnValue);
      }
    });
  };

  this.unbind = function () {
    if ($mount) {
      $mount = null;

      location.off('location_status_changed');
      location.off('location_type_changed');

      ui.offAll($elems);
      $elems = {};
    }
  };
};
