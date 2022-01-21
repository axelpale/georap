// Tools
var urls = require('georap-urls-client');
var ui = require('georap-ui');
var emitter = require('component-emitter');
// Templates
var template = require('./template.ejs');
var statusListTemplate = require('./statusList.ejs');
var typeListTemplate = require('./typeList.ejs');
// Config
var locationStatuses = georap.config.locationStatuses;
var locationTypes = georap.config.locationTypes;
var __ = georap.i18n.__;

module.exports = function (location) {

  // Setup
  var $mount = null;
  var $elems = {};
  var self = this;
  emitter(self);

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    $mount.html(template({
      // List of available statuses
      statusListHtml: statusListTemplate({
        locationStatuses: locationStatuses,
        currentStatus: location.getStatus(),
        __: __,
      }),
      // List of available types
      typeListHtml: typeListTemplate({
        locationTypes: locationTypes,
        currentType: location.getType(),
        toSymbolUrl: urls.locationTypeToSymbolUrl,
      }),
      __: __,
    }));

    $elems.show = $mount.find('.location-statustype-form-show');
    $elems.form = $mount.find('.location-statustype-form');
    $elems.cancel = $mount.find('.location-statustype-form-cancel');
    $elems.progress = $mount.find('.location-statustype-progress');
    $elems.error = $mount.find('.location-statustype-error');
    $elems.statusList = $mount.find('.location-status-list');
    $elems.typeList = $mount.find('.location-type-list');

    // Form cancel
    $elems.cancel.click(function (ev) {
      ev.preventDefault();
      self.emit('cancel');
    });

    var submitStatus = function (newStatus) {
      ui.show($elems.progress);
      ui.hide($elems.form);

      location.setStatus(newStatus, function (err) {
        if ($mount) {
          ui.hide($elems.progress);

          if (err) {
            console.error(err);
            ui.show($elems.error);
            return;
          }
          // Everything ok
        }
      });
    };

    var submitType = function (newType) {
      ui.show($elems.progress);
      ui.hide($elems.form);

      location.setType(newType, function (err) {
        if ($mount) {
          ui.hide($elems.progress);

          if (err) {
            console.error(err);
            ui.show($elems.error);
            return;
          }
          // Everything ok
        }
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
      ui.offAll($elems);
      $elems = {};
    }
  };
};
