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
// Apis
var locations = georap.stores.locations;
// ViewMode state store
var store = require('./store');

module.exports = function (loc) {
  // Parameters
  //   loc
  //     raw location object
  //

  // Setup
  var $mount = null;
  var $elems = {};
  var self = this;
  emitter(self);

  this.bind = function ($mountEl) {
    $mount = $mountEl;

    var viewMode = store.getState().viewMode;

    $mount.html(template({
      // List of available statuses
      statusListHtml: statusListTemplate({
        locationStatuses: locationStatuses,
        currentStatus: loc.status,
        toTemplateUrl: urls.locationStatusToTemplateUrl,
        __: __,
      }),
      // List of available types
      typeListHtml: typeListTemplate({
        locationTypes: locationTypes,
        currentType: loc.type,
        toSymbolUrl: urls.locationTypeToSymbolUrl,
        __: __,
      }),
      viewMode: viewMode,
      __: __,
    }));

    $elems.denseBtn = $mount.find('.viewmode-dense-btn');
    $elems.listBtn = $mount.find('.viewmode-list-btn');
    $elems.form = $mount.find('.location-statustype-form');
    $elems.cancel = $mount.find('.location-statustype-form-cancel');
    $elems.progress = $mount.find('.location-statustype-progress');
    $elems.error = $mount.find('.location-statustype-error');
    $elems.statusList = $mount.find('.location-status-list');
    $elems.typeList = $mount.find('.location-type-list');

    // View settings
    $elems.denseBtn.click(function () {
      store.emit('dense');
      $elems.statusList.addClass('viewmode-dense');
      $elems.typeList.addClass('viewmode-dense');
      $elems.denseBtn.addClass('active');
      $elems.listBtn.removeClass('active');
    });
    $elems.listBtn.click(function () {
      store.emit('list');
      $elems.statusList.removeClass('viewmode-dense');
      $elems.typeList.removeClass('viewmode-dense');
      $elems.denseBtn.removeClass('active');
      $elems.listBtn.addClass('active');
    });

    // Form cancel
    $elems.cancel.click(function (ev) {
      ev.preventDefault();
      self.emit('cancel');
    });

    // Click on a status button
    // User might click on button, its label, or its icon.
    // The icon and the label must have pointer-events:none
    $elems.statusList.click(function (ev) {
      ev.preventDefault(); // Avoid page reload.
      var btn = ev.target;
      if (btn.dataset.status) {
        $elems.statusList
          .find('.georap-tag-active')
          .removeClass('georap-tag-active');
        $(btn).addClass('georap-tag-active');
      }
    });

    // Click on a type button
    $elems.typeList.click(function (ev) {
      ev.preventDefault(); // Avoid page reload.
      var btn = ev.target;
      if (btn.dataset.type) {
        $elems.typeList
          .find('.georap-tag-active')
          .removeClass('georap-tag-active');
        $(btn).addClass('georap-tag-active');
      }
    });

    $elems.form.submit(function (ev) {
      ev.preventDefault();
      var statusBtn = $elems.statusList.find('.georap-tag-active').get(0);
      var selectedStatus = statusBtn.dataset.status;
      var typeBtn = $elems.typeList.find('.georap-tag-active').get(0);
      var selectedType = typeBtn.dataset.type;

      // No need to submit if nothing changed
      var sameStatus = selectedStatus === loc.status;
      var sameType = selectedType === loc.type;
      if (sameStatus && sameType) {
        self.emit('cancel');
        return;
      }

      ui.show($elems.progress);
      ui.hide($elems.form);

      locations.setType(loc._id, selectedStatus, selectedType, function (err) {
        if ($mount) {
          // Hide progress bar only on error.
          // The parent component rebinds at successful status or type
          // change event.
          if (err) {
            ui.hide($elems.progress);
            console.error(err);
            ui.show($elems.error);
            return;
          }
          // Everything ok
        }
      });
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
